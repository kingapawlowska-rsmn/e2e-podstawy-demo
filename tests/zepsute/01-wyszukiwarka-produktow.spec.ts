import { test, expect } from '@playwright/test';

// Wymaganie: wyszukanie słowa „szampon” pokazuje produkt „Szampon nawilżający”.

test('wyszukiwarka znajduje szampon nawilżający', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Szukaj produktu').fill('szampon');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Pełna nazwa i exact: samo „Szampon” pasuje też do „Szampon dla dzieci” i komórek z przyciskami.
  await expect(page.getByRole('cell', { name: 'Szampon nawilżający', exact: true })).toBeVisible();
});
