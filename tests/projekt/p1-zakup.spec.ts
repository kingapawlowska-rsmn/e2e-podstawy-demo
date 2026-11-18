import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P1: zakup z płatnością przy odbiorze.
// Wymaganie: klient dodaje „Balsam do ciała” do koszyka i klika „Złóż zamówienie (płatność przy odbiorze)”.
// - aplikacja przechodzi na „Moje zamówienia” i pokazuje „Złożono zamówienie: ZAM-…” z nowym numerem;
// - na liście jest wiersz z tym numerem, produktem „Balsam do ciała” i statusem „Nowe”;
// - na stronie „Produkty” stan „Balsam do ciała” jest mniejszy o 1 niż przed zakupem.
// Test tylko lokalnie: sprząta kontem admin (anuluje zamówienie), a hasło admina na serwerze zna tylko trener.

const produkt = 'Balsam do ciała';

test.describe('P1. Zakup z płatnością przy odbiorze', () => {
  // Numer zamówienia złożonego w teście, potrzebny do sprzątania.
  let numer = '';

  test.afterEach(async ({ request }) => {
    // Sprzątanie: administrator anuluje zamówienie, więc stan magazynu wraca.
    if (!numer) return;
    await zalogujPrzezApi(request, 'admin', 'admin123');
    const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`);
    expect(anulowanie.status()).toBe(200);
  });

  test('zamówienie Balsamu do ciała ma status Nowe, a stan na stronie Produkty spada o 1', async ({ page }) => {
    await zaloguj(page);
    // Pusty koszyk na start, żeby zamówienie dotyczyło tylko balsamu.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);

    // Stan przed zakupem bierzemy z API, bo zależy od wcześniejszych zamówień.
    const przed = (await (await page.request.get('/api/products/10')).json()).stock;

    await page.goto('/');
    await page.getByRole('button', { name: `Dodaj do koszyka: ${produkt}` }).click();
    await expect(page).toHaveURL(/dodano=/);

    await page.goto('/koszyk');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    // Strona „Moje zamówienia” z numerem nowego zamówienia w adresie.
    await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
    numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
    await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();
    await expect(page.getByText(`Złożono zamówienie: ${numer}`, { exact: true })).toBeVisible();

    // Wiersz z nowym numerem: produkt i status.
    const wiersz = page.getByRole('row').filter({ hasText: numer });
    await expect(wiersz.getByRole('cell', { name: produkt, exact: true })).toBeVisible();
    await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();

    // Strona „Produkty”: w wierszu balsamu stan o 1 mniejszy.
    await page.goto('/');
    const wierszProduktu = page.getByRole('row').filter({ hasText: produkt });
    await expect(wierszProduktu.getByRole('cell', { name: String(przed - 1), exact: true })).toBeVisible();
  });
});
