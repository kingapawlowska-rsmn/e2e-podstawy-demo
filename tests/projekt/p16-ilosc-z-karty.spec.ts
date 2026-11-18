import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt P16: ilość z karty produktu.
// Wymaganie po zmianie Bożeny z 13:00 (docs/cwiczenia/12b-zmiana-wymagan.md): Biuro Mikołaja kupuje
// „Kalendarz adwentowy 2026”, 24 sztuki, po jednym na każde okienko. Klient na karcie produktu
// wpisuje w pole „Ilość” 24 i klika „Dodaj do koszyka”.
// - w koszyku wiersz „Kalendarz adwentowy 2026”: ilość 24, wartość „959,76 zł”;
// - suma „razem” w koszyku jest równa sumie kolumny „Wartość”.

const produkt = 'Kalendarz adwentowy 2026';

test.describe('P16. Ilość z karty produktu', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // Pusty koszyk: wtedy suma „razem” to tylko kalendarze, czyli 959,76 zł.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test.afterEach(async ({ page }) => {
    // DELETE /api/cart usuwa każdy produkt, więc sprząta także kalendarze.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test('24 kalendarze z karty produktu dają w koszyku wartość i sumę 959,76 zł', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article', { name: produkt }).getByRole('link', { name: produkt }).click();
    await expect(page.getByRole('heading', { name: produkt, level: 1 })).toBeVisible();

    await page.getByLabel('Ilość').fill('24');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await expect(page).toHaveURL(/dodano=/);

    await page.goto('/koszyk');
    const wiersz = page.getByRole('row').filter({ hasText: produkt });
    await expect(wiersz.getByRole('cell', { name: '24', exact: true })).toBeVisible();
    await expect(wiersz.getByRole('cell', { name: '959,76 zł', exact: true })).toBeVisible();

    // W koszyku są tylko kalendarze, więc suma kolumny „Wartość” to 959,76 zł.
    await expect(page.getByText(/^Pozycji:/)).toHaveText('Pozycji: 1, razem: 959,76 zł');
  });
});
