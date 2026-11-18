import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P10: zamówienie na firmę i faktura.
// Wymaganie: Biuro Mikołaja (biuro) dodaje do koszyka „Kalendarz adwentowy 2026”, zaznacza
// „Faktura na firmę”, wpisuje NIP 101-202-30-36 i nazwę „Biuro Mikołaja”, klika „Złóż zamówienie (płatność przy odbiorze)”.
// - strona „Moje zamówienia”, w adresie numer nowego zamówienia (zlozono=ZAM-…);
// - na stronie zamówienia: „Faktura na firmę: Biuro Mikołaja” i NIP 1012023036;
// - „Pobierz fakturę” pobiera plik faktura-ZAM-….html z numerem FV/2026/ZAM-…, danymi nabywcy
//   i kwotą „Razem do zapłaty: 39,99 zł”;
// - NIP 101-202-30-37 (zła suma kontrolna) zatrzymuje zamówienie: komunikat
//   „Nieprawidłowy NIP: błędna suma kontrolna”, klient zostaje w koszyku.
// Test tylko lokalnie: konto biuro i sprzątanie kontem admin.

// Oba testy używają koszyka konta biuro, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.describe('P10. Zamówienie na firmę i faktura', () => {
  let numer = '';

  test.beforeEach(async ({ page }) => {
    await zaloguj(page, 'biuro', 'biuro123');
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
    await page.goto('/');
    await page.getByRole('button', { name: 'Dodaj do koszyka: Kalendarz adwentowy 2026' }).click();
    await expect(page).toHaveURL(/dodano=/);
    await page.goto('/koszyk');
    await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  });

  test.afterEach(async ({ page, request }) => {
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
    if (!numer) return;
    await zalogujPrzezApi(request, 'admin', 'admin123');
    expect((await request.post(`/api/admin/orders/${numer}/cancel`)).status()).toBe(200);
    numer = '';
  });

  test('zamówienie z NIP 101-202-30-36 ma fakturę dla Biuro Mikołaja na 39,99 zł', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-36');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
    numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
    await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();

    await page.goto(`/zamowienia/${numer}`);
    await expect(page.getByText(/^Faktura na firmę:/)).toHaveText('Faktura na firmę: Biuro Mikołaja, NIP 1012023036');

    // Plik faktury: nazwa z pobierania, treść z tego samego adresu.
    const pobieranie = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
    expect((await pobieranie).suggestedFilename()).toBe(`faktura-${numer}.html`);

    const plik = await (await page.request.get(`/zamowienia/${numer}/faktura`)).text();
    expect(plik).toContain(`FV/2026/${numer}`);
    expect(plik).toContain('Biuro Mikołaja');
    expect(plik).toContain('NIP nabywcy: 1012023036');
    expect(plik).toContain('Razem do zapłaty: 39,99 zł');
  });

  test('NIP 101-202-30-37 zatrzymuje zamówienie komunikatem o błędnej sumie kontrolnej', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-37');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Koszyk', level: 1 })).toBeVisible();
  });
});
