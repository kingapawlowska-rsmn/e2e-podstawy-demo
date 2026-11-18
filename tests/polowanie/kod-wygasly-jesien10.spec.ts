import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: wygasły kod rabatowy JESIEN10.
// Wymaganie (docs/cwiczenia/extra-d1-przegladarki-i-dane.md): kod JESIEN10 wygasł, więc koszyk go
// odrzuca komunikatem „Kod JESIEN10 wygasł 31.10.2026.” i nie nalicza rabatu.

test.describe('Wygasły kod rabatowy', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // Start: w koszyku tylko „Szampon nawilżający” (12,99 zł), bez kodu.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
    expect((await page.request.post('/api/cart/items', { data: { product_id: 1, qty: 1 } })).status()).toBe(201);
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: usuwa produkt i kod, także gdy kod został przyjęty.
    expect((await page.request.delete('/api/cart')).status()).toBe(200);
  });

  test('kod JESIEN10 jest odrzucony komunikatem o wygaśnięciu i nie daje rabatu', async ({ page }) => {
    await page.goto('/koszyk');
    await page.getByLabel('Kod rabatowy').fill('JESIEN10');
    await page.getByRole('button', { name: 'Użyj kodu' }).click();

    await expect(page.getByRole('alert')).toHaveText('Kod JESIEN10 wygasł 31.10.2026.');
    // Linia „Przed rabatem: …” pojawia się tylko przy przyjętym kodzie; suma zostaje 12,99 zł.
    await expect(page.getByText(/^Przed rabatem:/)).toHaveCount(0);
    await expect(page.getByText(/^Pozycji:/)).toHaveText('Pozycji: 1, razem: 12,99 zł');
  });
});
