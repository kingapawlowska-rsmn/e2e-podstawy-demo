import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P15: status zamówienia w panelu admina.
// Wymaganie: test składa zamówienie przez API jako klient. Administrator otwiera
// /admin/zamowienia/<numer>, wybiera w polu „Status zamówienia” „Opłacone” i klika „Zapisz status”,
// potem tak samo „Wysłane”.
// - po każdym zapisie status na stronie zamówienia to odpowiednio „Opłacone” i „Wysłane”;
// - klient widzi w GET /api/orders/<numer> status "shipped".
// Test tylko lokalnie: wymaga konta admin. Wysłanego zamówienia nie da się anulować,
// dlatego test zawsze tworzy własne, nowe zamówienie.

test('administrator zmienia status na Opłacone i Wysłane, a klient widzi shipped', async ({ page, request }) => {
  // `request` zostaje zalogowany jako klient, a przeglądarka jako admin.
  await zalogujPrzezApi(request);
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 20, qty: 1 } });
  expect(odpowiedz.status()).toBe(201);
  const { number: numer } = await odpowiedz.json();

  await zaloguj(page, 'admin', 'admin123');
  await page.goto(`/admin/zamowienia/${numer}`);

  for (const status of ['Opłacone', 'Wysłane']) {
    await page.getByLabel('Status zamówienia').selectOption(status);
    await page.getByRole('button', { name: 'Zapisz status' }).click();
    await expect(page.getByText(/^Status:/)).toHaveText(`Status: ${status}`);
  }

  const zamowienie = await request.get(`/api/orders/${numer}`);
  expect(zamowienie.status()).toBe(200);
  expect((await zamowienie.json()).status).toBe('shipped');
});
