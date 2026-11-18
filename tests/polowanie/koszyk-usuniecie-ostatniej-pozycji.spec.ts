import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: licznik koszyka po usunięciu ostatniej pozycji.
// Wymaganie: licznik „Pozycji” pokazuje liczbę pozycji w koszyku. Gdy klient usunie przyciskiem „Usuń”
// jedyną pozycję, koszyk jest pusty i licznik pokazuje „Pozycji: 0, razem: 0,00 zł”.

test.describe('Usunięcie ostatniej pozycji z koszyka', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // Start: w koszyku tylko jedno „Mydło w kostce” (serwer jest wspólny, więc najpierw czyścimy).
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
    expect((await page.request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } })).status()).toBe(201);
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie także po nieudanym teście.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test('po usunięciu jedynej pozycji koszyk pokazuje Pozycji: 0, razem: 0,00 zł', async ({ page }) => {
    await page.goto('/koszyk');
    await expect(page.getByText(/^Pozycji:/)).toHaveText('Pozycji: 1, razem: 4,99 zł');

    await page.getByRole('button', { name: 'Usuń: Mydło w kostce' }).click();

    // Ten tekst stoi w jednym akapicie z linkiem „Wybierz produkty”, więc szukamy fragmentu.
    await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
    // Gdy licznik nie przelicza się po usunięciu, zostaje „Pozycji: 1” i asercja padnie.
    await expect(page.getByText(/^Pozycji:/)).toHaveText('Pozycji: 0, razem: 0,00 zł');
  });
});
