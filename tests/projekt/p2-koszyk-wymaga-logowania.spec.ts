import { test, expect } from '@playwright/test';

// Projekt P2: koszyk wymaga logowania.
// Wymaganie: niezalogowany klient otwiera /koszyk, potem loguje się.
// - przed logowaniem aplikacja pokazuje stronę „Logowanie”, adres zawiera next=%2Fkoszyk;
// - po zalogowaniu klient wraca na stronę „Koszyk”, a nie na stronę główną.
// Funkcja zaloguj() sama otwiera /logowanie i zgubiłaby parametr next, dlatego formularz
// wypełniamy tu ręcznie. Konto bierzemy z tych samych zmiennych co zaloguj().
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test('niezalogowany klient trafia na logowanie, a po zalogowaniu wraca do koszyka', async ({ page }) => {
  await page.goto('/koszyk');

  await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
  await expect(page).toHaveURL(/next=%2Fkoszyk/);

  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Po zalogowaniu strona „Koszyk”, a nie strona główna „Produkty”.
  await expect(page.getByRole('heading', { name: 'Koszyk', level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\/koszyk$/);
});
