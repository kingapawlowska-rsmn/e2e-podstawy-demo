import { test, expect } from '@playwright/test';

// Polowanie: sortowanie „Cena: od najniższej” na stronie produktów.
// Wymaganie: po sortowaniu od najniższej ceny pierwszy w tabeli jest najtańszy produkt,
// czyli „Mydło w kostce” za 4,99 zł (najniższa cena w /api/products: 499 groszy).

test('sortowanie od najniższej ceny pokazuje na początku Mydło w kostce za 4,99 zł', async ({ page }) => {
  // Strona produktów nie wymaga logowania i test nie zmienia danych.
  // Ścieżka względna: adres serwera bierzemy z BASE_URL (rc albo wersja zwykła).
  await page.goto('/');

  await page.getByLabel('Sortuj').selectOption('Cena: od najniższej');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Wiersze produktów mają komórki (cell); wiersz nagłówka ich nie ma.
  // Pierwszy wiersz to dokładnie to, co sprawdzamy: kolejność po sortowaniu.
  const pierwszyProdukt = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('cell') }).first();

  // Bez sortowania pierwszy jest „Balsam do ciała”, więc asercje padną, gdy sortowanie nie zadziała.
  await expect(pierwszyProdukt.getByRole('cell', { name: 'Mydło w kostce', exact: true })).toBeVisible();
  await expect(pierwszyProdukt.getByRole('cell', { name: '4,99 zł', exact: true })).toBeVisible();
});
