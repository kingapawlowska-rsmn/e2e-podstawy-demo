import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista zamówień dochodzi z API z opóźnieniem 0,5–2 s.
  // count() nie czeka, więc liczył wiersze, gdy strona pokazywała jeszcze „Ładowanie…”.
  // Asercja web-first czeka, aż pojawi się pierwszy wiersz z numerem zamówienia (wiersz nagłówka go nie ma).
  await expect(page.getByRole('row').filter({ hasText: /ZAM-\d+/ }).first()).toBeVisible();
});
