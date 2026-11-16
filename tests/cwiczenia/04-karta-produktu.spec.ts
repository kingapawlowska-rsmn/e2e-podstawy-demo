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
