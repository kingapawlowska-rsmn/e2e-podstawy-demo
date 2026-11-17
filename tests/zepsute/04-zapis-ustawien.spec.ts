import { test, expect } from '@playwright/test';

// Wymaganie: administrator zapisuje ustawienia sklepu bez zmian. Widzi komunikat
// „Zapisano ustawienia”, a tryb konserwacji zostaje wyłączony.

test('zapis ustawień pokazuje komunikat', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/admin/ustawienia');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  // Komunikat znika po 3–5 s, więc sprawdzamy go od razu po zapisie, bez stałej pauzy.
  await expect(page.getByText('Zapisano ustawienia')).toBeVisible();
  await expect(page.getByTestId('maintenance-state')).toHaveText('Stan: wyłączony');
});
