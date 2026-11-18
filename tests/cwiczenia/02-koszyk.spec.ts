import { test, expect } from "@playwright/test";

// Ćwiczenie 02: pierwszy test „produkt w promocji w koszyku”.
// Karta: docs/cwiczenia/02-pierwszy-test.md

test("produkt w promocji trafia do koszyka z ceną promocyjną", async ({
  page,
}) => {
  // 1. Zaloguj się jako klient (tak jak w tests/przyklady/logowanie.spec.ts).
  await page.goto("/logowanie");
  await page.getByLabel("Login").fill("user");
  await page.getByLabel("Hasło").fill("user123");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByText("Zalogowano jako user")).toBeVisible();

  // 2. Przejdź do „Produkty” i dodaj krem do koszyka.
  // Szukamy wiersza tabeli, bo pod tabelą są kafelki z tą samą nazwą.
  await page.getByRole("link", { name: "Produkty" }).click();
  const wierszKremu = page
    .getByRole("row")
    .filter({ hasText: "Krem do twarzy na dzień" });
  await wierszKremu.getByRole("button", { name: "Dodaj do koszyka" }).click();

  // 3. Sprawdź komunikat po dodaniu.
  await expect(
    page.getByText("Produkt w koszyku: Krem do twarzy na dzień"),
  ).toBeVisible();

  // 4. Przejdź do koszyka przez link w menu.
  await page.getByRole("link", { name: "Koszyk" }).click();

  // 5. W wierszu kremu w koszyku ma być cena promocyjna.
  const wierszWKoszyku = page
    .getByRole("row")
    .filter({ hasText: "Krem do twarzy na dzień" });
  await expect(wierszWKoszyku).toContainText("26,39 zł");
});
