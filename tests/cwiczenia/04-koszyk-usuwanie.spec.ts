import { test, expect } from '@playwright/test';
import { TEKSTY } from '../pomocnicze/teksty';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // 1. Zaloguj się jako klient.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // 2. Dodaj żel do koszyka z tabeli produktów.
  // Szukamy wiersza tabeli, bo pod tabelą mogą być kafelki z tą samą nazwą.
  await page.getByRole('link', { name: 'Produkty' }).click();
  const wierszZeluNaLiscie = page
    .getByRole('row')
    .filter({ hasText: 'Żel pod prysznic' });
  await wierszZeluNaLiscie.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText(TEKSTY.dodanoDoKoszyka('Żel pod prysznic'))).toBeVisible();

  // 3. Otwórz koszyk i sprawdź, że żel w nim jest.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszZeluWKoszyku = page
    .getByRole('row')
    .filter({ hasText: 'Żel pod prysznic' });
  await expect(wierszZeluWKoszyku).toBeVisible();

  // 4. Kliknij „Usuń” w wierszu żelu.
  // Przycisk ma dostępną nazwę „Usuń: Żel pod prysznic”.
  await wierszZeluWKoszyku.getByRole('button', { name: 'Usuń: Żel pod prysznic' }).click();

  // 5. Po usunięciu adres to /koszyk?usunieto=1, a wiersza żelu już nie ma.
  await expect(page).toHaveURL(/\/koszyk/);
  await expect(wierszZeluWKoszyku).toHaveCount(0);
});
