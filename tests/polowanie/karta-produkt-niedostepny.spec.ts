import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: produktu niedostępnego nie da się dodać do koszyka z karty produktu.
// Wymaganie (tests/czytanie/05-karta-produktu.spec.ts i tests/review/09-produkt-niedostepny.spec.ts):
// karta niedostępnego produktu pokazuje „Chwilowo brak” (przed hotfiksem „Niedostępny”), a przycisk „Dodaj do koszyka” jest wyłączony.
// „Maska do włosów z olejem arganowym” i „Serum z witaminą C” mają stan 0.
// Test tylko czyta strony, więc nie ma czego sprzątać.

for (const produkt of ['Maska do włosów z olejem arganowym', 'Serum z witaminą C']) {
  test(`karta niedostępnego produktu ${produkt} ma wyłączony przycisk Dodaj do koszyka`, async ({ page }) => {
    await zaloguj(page);
    // Karta otwierana z kafelka na stronie głównej, tak jak robi to klient.
    await page.goto('/');
    await page.getByRole('article', { name: produkt }).getByRole('link', { name: produkt }).click();
    await expect(page.getByRole('heading', { name: produkt, level: 1 })).toBeVisible();

    await expect(page.getByText('Chwilowo brak', { exact: true })).toBeVisible();
    // Gdy przycisk jest aktywny, klient może próbować dodać produkt, którego nie ma.
    await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
}
