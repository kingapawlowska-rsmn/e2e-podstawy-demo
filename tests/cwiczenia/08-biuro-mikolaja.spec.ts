import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// Ćwiczenie 08, część B: zamówienie firmowe „Biuro Mikołaja” → status → faktura.
// Przypadek testowy: docs/scenariusze/biuro-mikolaja.md (kroki 1–10),
// ten sam scenariusz w Gherkinie: docs/scenariusze/biuro-mikolaja.feature.
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/08-biuro-mikolaja.spec.ts

test('Biuro Mikołaja: zamówienie na firmę, status „Wysłane” i faktura z NIP nabywcy', async ({ page }) => {
  // Krok 1 (gotowy). Logowanie klienta firmowego. Koszyk musi być pusty (warunek wstępny):
  // po nieudanym przebiegu mogły w nim zostać kalendarze. DELETE /api/cart opróżnia koszyk
  // zalogowanego klienta; page.request korzysta z logowania z tej przeglądarki.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.request.delete('/api/cart');

  // TODO 2: karta produktu /produkt/21, „Ilość” 10, „Dodaj do koszyka”, sprawdź komunikat
  await page.goto('/produkt/21');
  await page.getByRole('spinbutton', { name: 'Ilość' }).fill('10');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Produkt w koszyku: Kalendarz adwentowy 2026')).toBeVisible();

  // TODO 3: koszyk: ilość 10 w wierszu kalendarza, jedna pozycja, razem 399,90 zł
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszKalendarza = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wierszKalendarza.getByRole('cell', { name: '10', exact: true })).toBeVisible();
  await expect(page.getByText('Pozycji: 1, razem: 399,90 zł')).toBeVisible();

  // TODO 4: „Faktura na firmę”, NIP i nazwa firmy, „Złóż zamówienie (płatność przy odbiorze)”.
  //   Komunikat „Złożono zamówienie: …” znika po kilku sekundach: sprawdź go od razu.
  //   Numer zamówienia jest w adresie strony (/zamowienia?zlozono=ZAM-1008):
  //     const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
  await page.getByRole('textbox', { name: 'NIP' }).fill('241-224-12-28');
  await page.getByRole('textbox', { name: 'Nazwa firmy' }).fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();
  await expect(page.getByText(/Złożono zamówienie: ZAM-\d+/)).toBeVisible();
  await expect(page).toHaveURL(/zlozono=ZAM-/);
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

  // TODO 5: strona zamówienia: status „Nowe”, NIP 2412241228, link „Pobierz fakturę”
  // Numer zamówienia klikamy na liście „Moje zamówienia” (krok 5 przypadku testowego).
  await page.getByRole('link', { name: numer }).click();
  await expect(page.getByRole('heading', { name: `Zamówienie ${numer}` })).toBeVisible();
  await expect(page.getByText('Status: Nowe')).toBeVisible();
  // NIP zapisuje się bez myślników.
  await expect(page.getByText('Faktura na firmę: Biuro Mikołaja, NIP 2412241228')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Faktura (HTML)' })).toBeVisible();

  // TODO 6–8: „Wyloguj”, logowanie jako admin, /admin/zamowienia/<numer>,
  //   status „Opłacone”, „Zapisz status”, potem „Wysłane”. Po każdym zapisie sprawdź status.
  //   Lista „Status zamówienia” to <select>: selectOption('Zapłacone').
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  // Krok 6: zamówienie w panelu admina ma status „Nowe” i pole „Status zamówienia”.
  await page.goto(`/admin/zamowienia/${numer}`);
  await expect(page.getByText('Status: Nowe')).toBeVisible();
  const statusZamowienia = page.getByRole('combobox', { name: 'Status zamówienia' });
  await expect(statusZamowienia).toBeVisible();

  // Krok 7: zmiana na „Opłacone”.
  await statusZamowienia.selectOption('Zapłacone');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Zapłacone')).toBeVisible();

  // Krok 8: zmiana na „Wysłane”.
  await statusZamowienia.selectOption('Wysłane');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Wysłane')).toBeVisible();

  // TODO 9: „Wyloguj”, logowanie jako biuro, /zamowienia/<numer>: status „Wysłane”
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByText('Status: Wysłane')).toBeVisible();

  // TODO 10: pobranie faktury. Najpierw page.waitForEvent('download') do zmiennej, potem kliknięcie,
  //   potem await tej zmiennej. Sprawdź nazwę pliku (suggestedFilename) i treść:
  //   NIP nabywcy, pozycję z ilością 10 i wartością, „Razem do zapłaty: 399,90 zł”.
  //   Treść pliku: fs.readFileSync(await pobieranie.path(), 'utf8') (import fs from 'node:fs').
  //   Plik to strona HTML: page.setContent(tresc) wczytuje go do przeglądarki, potem zwykłe lokatory.
  const pobieranieCzeka = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Faktura (HTML)' }).click();
  const pobieranie = await pobieranieCzeka;
  expect(pobieranie.suggestedFilename()).toBe(`faktura-${numer}.html`);

  const tresc = fs.readFileSync(await pobieranie.path(), 'utf8');
  await page.setContent(tresc);
  await expect(page.getByText('NIP nabywcy: 2412241228')).toBeVisible();
  await expect(page.getByText('Biuro Mikołaja')).toBeVisible();
  // Pozycja faktury: Lp., nazwa, ilość, cena, wartość.
  const pozycja = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(pozycja.getByRole('cell')).toHaveText([
    '1',
    'Kalendarz adwentowy 2026',
    '10',
    '39,99 zł',
    '399,90 zł',
  ]);
  await expect(page.getByText('Razem do zapłaty: 399,90 zł')).toBeVisible();
});
