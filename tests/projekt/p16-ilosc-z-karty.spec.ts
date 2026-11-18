import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt P16: ilość z karty produktu.
// Wymaganie: klient na karcie produktu „Żel pod prysznic” wpisuje w pole „Ilość” 3 i klika „Dodaj do koszyka”.
// - w koszyku wiersz „Żel pod prysznic”: ilość 3, wartość „29,97 zł”;
// - suma „razem” w koszyku jest równa sumie kolumny „Wartość”.

const produkt = 'Żel pod prysznic';

test.describe('P16. Ilość z karty produktu', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // Pusty koszyk: wtedy suma „razem” to tylko żel, czyli 29,97 zł.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test.afterEach(async ({ page }) => {
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test('3 sztuki żelu z karty produktu dają w koszyku wartość i sumę 29,97 zł', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article', { name: produkt }).getByRole('link', { name: produkt }).click();
    await expect(page.getByRole('heading', { name: produkt, level: 1 })).toBeVisible();

    await page.getByLabel('Ilość').fill('3');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await expect(page).toHaveURL(/dodano=/);

    await page.goto('/koszyk');
    const wiersz = page.getByRole('row').filter({ hasText: produkt });
    await expect(wiersz.getByRole('cell', { name: '3', exact: true })).toBeVisible();
    await expect(wiersz.getByRole('cell', { name: '29,97 zł', exact: true })).toBeVisible();

    // W koszyku jest tylko żel, więc suma kolumny „Wartość” to 29,97 zł.
    await expect(page.getByText(/^Pozycji:/)).toHaveText('Pozycji: 1, razem: 29,97 zł');
  });
});
