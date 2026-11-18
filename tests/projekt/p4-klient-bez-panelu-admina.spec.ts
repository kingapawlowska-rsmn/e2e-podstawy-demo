import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt P4: klient nie wejdzie do panelu administratora.
// Wymaganie: klient po zalogowaniu otwiera /admin.
// - strona z nagłówkiem „Brak uprawnień” i tekstem „Ta strona wymaga roli admin.”;
// - w menu klienta nie ma pozycji „Panel admina”, a w menu administratora jest.
// Test z kontem admin tylko lokalnie: hasło admina na serwerze zna tylko trener.

test.describe('P4. Panel administratora tylko dla admina', () => {
  test('klient na /admin widzi Brak uprawnień i nie ma w menu Panelu admina', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Brak uprawnień', level: 1 })).toBeVisible();
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Panel admina' }),
    ).toHaveCount(0);
  });

  test('administrator ma w menu pozycję Panel admina', async ({ page }) => {
    await zaloguj(page, 'admin', 'admin123');

    await expect(
      page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Panel admina' }),
    ).toBeVisible();
  });
});
