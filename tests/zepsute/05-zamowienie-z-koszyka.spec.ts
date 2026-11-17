import { test, expect } from '@playwright/test';

// Wymaganie: klient składa zamówienie z koszyka (płatność przy odbiorze)
// i widzi komunikat „Złożono zamówienie: …” z numerem nowego zamówienia.

test('zamówienie z koszyka pokazuje numer zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  // Test sam wkłada produkt do koszyka: nie polega na tym, co zostało w koszyku po ręcznym klikaniu.
  // Po złożeniu zamówienia koszyk jest pusty, więc bez tego kroku przycisk zamówienia jest wyłączony.
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj do koszyka: Szampon nawilżający' }).click();

  await page.goto('/koszyk');
  await expect(page.getByRole('row').filter({ hasText: 'Szampon nawilżający' })).toBeVisible();
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page.getByText(/Złożono zamówienie: ZAM-\d+/)).toBeVisible();
});
