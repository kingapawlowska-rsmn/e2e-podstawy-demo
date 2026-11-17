import { test, expect } from '@playwright/test';

// Wymaganie: administrator po zalogowaniu widzi w menu link „Panel admina”.

test('administrator widzi link do panelu admina', async ({ page }) => {
  await page.goto('/logowanie');

  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  // Przycisk w formularzu ma napis „Zaloguj”, nie „Zaloguj się”.
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByRole('link', { name: 'Panel admina' })).toBeVisible();
});
