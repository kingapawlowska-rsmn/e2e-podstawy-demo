import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt P12: drugi adres w profilu.
// Wymaganie: klient na stronie „Moje adresy” dodaje adres (nazwa unikalna, ul. Biurowa 7, 00-950,
// Warszawa, 600 700 800) i ustawia go jako domyślny.
// - komunikat „Dodano adres: <nazwa>” i nowy adres na liście;
// - po „Ustaw jako domyślny” plakietka „Domyślny” jest przy nowym adresie i jest tylko jedna;
// - „Adres główny” nie ma przycisku „Usuń”.
// Test na koniec usuwa swój adres. Wtedy „Domyślny” wraca do „Adres główny”.

test.describe('P12. Drugi adres w profilu', () => {
  // Unikalna nazwa: godzina z sekundami.
  const nazwa = `Praca ${new Date().toLocaleTimeString('pl-PL')}`;

  test.afterEach(async ({ page }) => {
    // Sprzątanie także po nieudanym teście: usuń adresy o tej nazwie, domyślny = adres główny (id 0).
    const adresy = await (await page.request.get('/api/account/addresses')).json();
    for (const adres of adresy) {
      if (adres.name === nazwa) await page.request.delete(`/api/account/addresses/${adres.id}`);
    }
    await page.request.put('/api/account/addresses/0/default');
  });

  test('nowy adres zostaje jedynym domyślnym, a po usunięciu domyślny wraca do Adres główny', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/konto/adresy');

    await page.getByLabel('Nazwa adresu').fill(nazwa);
    await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
    await page.getByLabel('Kod pocztowy').fill('00-950');
    await page.getByLabel('Miasto').fill('Warszawa');
    await page.getByLabel('Telefon').fill('600 700 800');
    await page.getByRole('button', { name: 'Dodaj adres' }).click();

    await expect(page.getByText(`Dodano adres: ${nazwa}`, { exact: true })).toBeVisible();
    await expect(page.getByRole('article', { name: nazwa, exact: true })).toBeVisible();

    await page.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` }).click();

    // Nazwa karty adresu zawiera plakietkę: „<nazwa> Domyślny”.
    await expect(page.getByRole('article', { name: `${nazwa} Domyślny`, exact: true })).toBeVisible();
    await expect(page.getByText('Domyślny', { exact: true })).toHaveCount(1);
    await expect(page.getByRole('article', { name: 'Adres główny', exact: true }).getByRole('button', { name: /Usuń/ })).toHaveCount(0);

    // Usunięcie własnego adresu: plakietka wraca do adresu głównego.
    await page.getByRole('button', { name: `Usuń adres: ${nazwa}` }).click();
    await expect(page.getByRole('article', { name: 'Adres główny Domyślny', exact: true })).toBeVisible();
  });
});
