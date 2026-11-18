import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: przycisk „Dodaj do koszyka” na karcie produktu niedostępnego.
// Wymaganie (tests/review/09-produkt-niedostepny.spec.ts): Serum z witaminą C nie ma na stanie.
// Karta produktu pokazuje „Niedostępny”, a przycisk „Dodaj do koszyka” jest wyłączony.
// Test tylko czyta stronę, więc nie ma czego sprzątać.

test('karta niedostępnego Serum z witaminą C ma wyłączony przycisk Dodaj do koszyka', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/7');
  await expect(page.getByRole('heading', { name: 'Serum z witaminą C', level: 1 })).toBeVisible();

  await expect(page.getByText('Niedostępny', { exact: true })).toBeVisible();
  // Gdy przycisk jest aktywny, klient może próbować dodać produkt, którego nie ma.
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
