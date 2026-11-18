import { test, expect } from "@playwright/test";
import { zaloguj } from "../pomocnicze/logowanie";

// Projekt P3: administrator dodaje produkt w „Panel admina” › „Produkty”.
// Test tylko lokalnie: na wspólnym serwerze hasło konta admin zna tylko trener.
// Aplikacja nie ma usuwania produktów, więc test tworzy własny produkt z unikalną nazwą
// (data i godzina w nazwie). Dzięki temu przechodzi przy każdym uruchomieniu.
// Lokalnie stan startowy przywraca `npm run db:reset`.

test("administrator dodaje produkt, a wyszukiwarka na stronie Produkty pokazuje go jako dostępny za 12,50 zł", async ({
  page,
}) => {
  const nazwa = `Produkt testowy P3 ${new Date().toISOString()}`;

  await zaloguj(page, "admin", "admin123");

  // Panel admina › Produkty (link w treści strony, bo w menu też jest „Produkty”)
  await page.getByRole("link", { name: "Panel admina" }).click();
  await page.getByRole("main").getByRole("link", { name: "Produkty" }).click();
  await expect(page).toHaveURL(/\/admin\/produkty$/);

  // Formularz „Dodaj produkt” z danymi ze scenariusza
  await page.getByLabel("Nazwa").fill(nazwa);
  await page.getByLabel("Kategoria").fill("Testowe");
  await page.getByLabel("Cena (zł)").fill("12,50");
  await page.getByLabel("Stan").fill("5");
  await page.getByRole("button", { name: "Dodaj produkt" }).click();

  await expect(
    page.getByText(`Dodano produkt: ${nazwa}`, { exact: true }),
  ).toBeVisible();

  // Strona „Produkty”: wyszukiwarka znajduje nowy produkt.
  // Pod tabelą są kafelki z tą samą nazwą i ceną, więc sprawdzamy wiersz tabeli.
  await page.goto("/");
  await page.getByLabel("Szukaj produktu").fill(nazwa);
  await page.getByRole("button", { name: "Filtruj" }).click();

  // Nazwa jest unikalna, więc wyszukiwarka ma zostawić dokładnie 1 produkt.
  // Bez filtrowania strona pokazuje wszystkie produkty i ta asercja padnie.
  await expect(page.getByText("Liczba produktów: 1", { exact: true })).toBeVisible();

  const wiersz = page.getByRole("row").filter({ hasText: nazwa });
  await expect(
    wiersz.getByRole("cell", { name: "12,50 zł", exact: true }),
  ).toBeVisible();
  await expect(
    wiersz.getByRole("cell", { name: "Dostępny", exact: true }),
  ).toBeVisible();
  await expect(
    wiersz.getByRole("button", { name: `Dodaj do koszyka: ${nazwa}` }),
  ).toBeEnabled();
});
