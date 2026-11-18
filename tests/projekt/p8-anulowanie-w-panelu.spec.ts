import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P8: zamówienie z API anulowane w panelu.
// Wymaganie: test zakłada zamówienie przez API jako user. Administrator znajduje je
// w „Panel admina” › „Zamówienia” po numerze i klika „Anuluj”.
// - w wierszu tego zamówienia status „Anulowane” i brak przycisku „Anuluj”;
// - GET /api/orders/<numer> zwraca status "cancelled";
// - inne zamówienia nie zmieniły statusu.
// Test tylko lokalnie: wymaga konta admin.

test.describe('P8. Anulowanie zamówienia w panelu admina', () => {
  // Dwa własne zamówienia: pierwsze anulujemy, drugie ma zostać „Nowe”.
  let anulowane = '';
  let inne = '';

  test.beforeEach(async ({ request }) => {
    await zalogujPrzezApi(request);
    for (const qty of [1, 2]) {
      const odpowiedz = await request.post('/api/orders', { data: { product_id: 20, qty } });
      expect(odpowiedz.status()).toBe(201);
      const { number } = await odpowiedz.json();
      if (qty === 1) anulowane = number;
      else inne = number;
    }
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie: anulujemy oba zamówienia. 409 znaczy, że już było anulowane.
    await zalogujPrzezApi(request, 'admin', 'admin123');
    for (const numer of [anulowane, inne]) {
      expect([200, 409]).toContain((await request.post(`/api/admin/orders/${numer}/cancel`)).status());
    }
  });

  test('administrator anuluje zamówienie w panelu, a drugie zamówienie zostaje Nowe', async ({ page }) => {
    await zaloguj(page, 'admin', 'admin123');
    await page.getByRole('link', { name: 'Panel admina' }).click();
    await page.getByRole('main').getByRole('link', { name: 'Zamówienia' }).click();

    await page.getByLabel('Szukaj zamówienia').fill(anulowane);
    await page.getByRole('button', { name: 'Szukaj' }).click();

    const wiersz = page.getByRole('row').filter({ hasText: anulowane });
    await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();
    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
    await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);

    // API: anulowane ma status cancelled, inne dalej new.
    const odpowiedz = await page.request.get(`/api/orders/${anulowane}`);
    expect(odpowiedz.status()).toBe(200);
    expect((await odpowiedz.json()).status).toBe('cancelled');
    expect((await (await page.request.get(`/api/orders/${inne}`)).json()).status).toBe('new');
  });
});
