import { test, expect } from "@playwright/test";

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Konto tester11 ma osobny koszyk: testy z ćwiczeń 02 i 04 dodają produkty do koszyka konta user.

test("cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku", async ({
  page,
}) => {
  // 1. Zaloguj się jako tester11.
  await page.goto("/logowanie");
  await page.getByLabel("Login").fill("tester11");
  await page.getByLabel("Hasło").fill("czarny-piatek-2026");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByText("Zalogowano jako tester11")).toBeVisible();

  // 2. Na stronie „Produkty” znajdź kafelek kremu.
  // Nazwa kremu jest też w tabeli, więc ceny szukamy tylko wewnątrz kafelka.
  // Kafelek to element <article>, którego nazwą jest nazwa produktu.
  await page.getByRole("link", { name: "Produkty" }).click();
  const kafelekKremu = page.getByRole("article", {
    name: "Krem do twarzy na dzień",
  });
  await expect(
    kafelekKremu.getByText("26,39 zł", { exact: true }),
  ).toBeVisible();
  await expect(
    kafelekKremu.getByText("32,99 zł", { exact: true }),
  ).toBeVisible();
  await expect(kafelekKremu.getByText("-20%", { exact: true })).toBeVisible();

  // 3. Kliknij nazwę produktu w kafelku i sprawdź kartę produktu.
  await kafelekKremu
    .getByRole("link", { name: "Krem do twarzy na dzień" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Krem do twarzy na dzień" }),
  ).toBeVisible();
  await expect(page.getByText("26,39 zł", { exact: true })).toBeVisible();
  await expect(page.getByText("32,99 zł", { exact: true })).toBeVisible();
  await expect(page.getByText("-20%", { exact: true })).toBeVisible();

  // 4. Dodaj krem do koszyka z karty produktu.
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await expect(
    page.getByText("Dodano do koszyka: Krem do twarzy na dzień"),
  ).toBeVisible();

  // 5. W koszyku sprawdź cenę kremu.
  // Bierzemy komórkę z plakietką -20%, czyli kolumnę „Cena”.
  // Kolumna „Wartość” też pokazuje 26,39 zł (ilość 1), ale nie ma plakietki.
  await page.getByRole("link", { name: "Koszyk" }).click();
  const wierszKremu = page
    .getByRole("row")
    .filter({ hasText: "Krem do twarzy na dzień" });
  const cenaKremu = wierszKremu.getByRole("cell").filter({ hasText: "-20%" });
  await expect(cenaKremu).toContainText("26,39 zł");

  // 6. Usuń krem, żeby następne uruchomienie zaczynało od pustego koszyka.
  await wierszKremu
    .getByRole("button", { name: "Usuń: Krem do twarzy na dzień" })
    .click();
  await expect(wierszKremu).toHaveCount(0);
});

// Dla szybszych: kod rabatowy. Konto tester12 ma własny koszyk, niezależny od tester11.
test("kod CZARNY20 obniża sumę do zapłaty za krem do 21,11 zł", async ({
  page,
}) => {
  // 1. Zaloguj się jako tester12.
  await page.goto("/logowanie");
  await page.getByLabel("Login").fill("tester12");
  await page.getByLabel("Hasło").fill("czarny-piatek-2026");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByText("Zalogowano jako tester12")).toBeVisible();

  // 2. Dodaj krem do koszyka z tabeli produktów.
  await page.getByRole("link", { name: "Produkty" }).click();
  await page
    .getByRole("button", { name: "Dodaj do koszyka: Krem do twarzy na dzień" })
    .click();
  await expect(
    page.getByText("Dodano do koszyka: Krem do twarzy na dzień"),
  ).toBeVisible();

  // 3. W koszyku wpisz kod CZARNY20 i zastosuj go.
  await page.getByRole("link", { name: "Koszyk" }).click();
  await page.getByLabel("Kod rabatowy").fill("CZARNY20");
  await page.getByRole("button", { name: "Zastosuj kod" }).click();
  await expect(
    page.getByText("Kod CZARNY20 przyjęty: -20% na całe zamówienie."),
  ).toBeVisible();

  // 4. Suma do zapłaty po rabacie: 26,39 zł - 20% = 21,11 zł.
  // Suma jest w akapicie „Pozycji: 1, razem: …”.
  await expect(page.getByText("razem:")).toContainText("21,11 zł");

  // 5. Sprzątanie: usuń kod, a potem krem, żeby koszyk tester12 był pusty.
  await page.getByRole("button", { name: "Usuń kod" }).click();
  await expect(page.getByRole("button", { name: "Usuń kod" })).toHaveCount(0);
  const wierszKremu = page
    .getByRole("row")
    .filter({ hasText: "Krem do twarzy na dzień" });
  await wierszKremu
    .getByRole("button", { name: "Usuń: Krem do twarzy na dzień" })
    .click();
  await expect(wierszKremu).toHaveCount(0);
});

// Produkt niedostępny: Serum z witaminą C ma stan 0. Karta produktu nie wymaga logowania.
test("na karcie niedostępnego serum przycisk „Dodaj do koszyka” i pole „Ilość” są wyłączone", async ({
  page,
}) => {
  // 1. Otwórz stronę „Produkty” i znajdź kafelek serum (nie wiersz tabeli).
  await page.goto("/");
  const kafelekSerum = page.getByRole("article", {
    name: "Serum z witaminą C",
  });

  // 2. Kliknij nazwę serum w kafelku, żeby otworzyć kartę produktu.
  await kafelekSerum.getByRole("link", { name: "Serum z witaminą C" }).click();
  await expect(
    page.getByRole("heading", { name: "Serum z witaminą C" }),
  ).toBeVisible();

  // 3. Produktu nie ma na stanie, więc nie da się go dodać do koszyka.
  await expect(
    page.getByRole("button", { name: "Dodaj do koszyka" }),
  ).toBeDisabled();
  await expect(page.getByLabel("Ilość")).toBeDisabled();
});
