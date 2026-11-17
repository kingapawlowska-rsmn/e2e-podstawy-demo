import { test, expect } from '@playwright/test';

// Ćwiczenie 06: tabela zamówień w panelu admina (/admin/zamowienia).
// Każdy wiersz dostaje nowe, losowe id przy każdym wyświetleniu strony
// i nie ma data-testid. Wiersz trzeba znaleźć po treści.
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts

test.describe('Panel admina: zamówienia', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie jako administrator i przejście do listy zamówień
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
    await page.goto('/admin/zamowienia');
  });

  test('anulowanie ZAM-1003 zmienia jego status na „Anulowane”', async ({ page }) => {
    // TODO 1: lokator wiersza z numerem ZAM-1003:
    //   page.getByRole('row').filter({ hasText: 'ZAM-1003' })
    const wiersz = page.getByRole('row').filter({ hasText: 'ZAM-1003' });
    // TODO 2: sprawdź, że wiersz ma status „Nowe” (stan przed akcją)
    await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();
    // TODO 3: kliknij „Anuluj” w tym wierszu (szukaj przycisku wewnątrz wiersza)
    await wiersz.getByRole('button', { name: 'Anuluj' }).click();
    // TODO 4: sprawdź komunikat „Anulowano zamówienie ZAM-1003”
    await expect(page.getByText('Anulowano zamówienie ZAM-1003')).toBeVisible();
    // TODO 5: sprawdź, że wiersz ma status „Anulowane” i nie ma już przycisku „Anuluj”
    await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
    await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);
  });

  test('wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006', async ({ page }) => {
    // TODO 1: wpisz „Mydło” w pole „Szukaj zamówienia” i kliknij „Szukaj”
    await page.getByLabel('Szukaj zamówienia').fill('Mydło');
    await page.getByRole('button', { name: 'Szukaj' }).click();
    // TODO 2: sprawdź napis „Znaleziono: 1”
    await expect(page.getByText('Znaleziono: 1')).toBeVisible();
    // TODO 3: policz wiersze z danymi (wiersz nagłówka nie zawiera „ZAM-”)
    //   i sprawdź, że jedyny wiersz to ZAM-1006
    const wierszeZDanymi = page.getByRole('row').filter({ hasText: 'ZAM-' });
    await expect(wierszeZDanymi).toHaveCount(1);
    await expect(wierszeZDanymi).toContainText('ZAM-1006');
  });

  test('wyszukanie nieistniejącego numeru daje pustą tabelę', async ({ page }) => {
    // TODO 1: wyszukaj „ZAM-9999”
    await page.getByLabel('Szukaj zamówienia').fill('ZAM-9999');
    await page.getByRole('button', { name: 'Szukaj' }).click();
    // TODO 2: sprawdź napis „Znaleziono: 0” i brak wierszy z danymi
    await expect(page.getByText('Znaleziono: 0')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ZAM-' })).toHaveCount(0);
  });
});
