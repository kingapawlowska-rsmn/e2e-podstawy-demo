import { test, expect } from "@playwright/test";
import { TEKSTY } from "../pomocnicze/teksty";

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test("błędny kod pocztowy blokuje zapis adresu", async ({ page }) => {
  // 1. Zaloguj się jako klient.
  await page.goto("/logowanie");
  await page.getByLabel("Login").fill("user");
  await page.getByLabel("Hasło").fill("user123");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByText("Zalogowano jako user")).toBeVisible();

  // 2. Otwórz „Adres dostawy” z menu.
  await page.getByRole("link", { name: "Adres dostawy" }).click();
  await expect(
    page.getByRole("heading", { name: "Zmiana adresu dostawy" }),
  ).toBeVisible();

  // 3. Wpisz kod pocztowy bez myślnika i zapisz formularz.
  await page.getByLabel("Kod pocztowy").fill("00000");
  await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();

  // 4. Nad formularzem pojawia się podsumowanie z liczbą błędów.
  await expect(page.getByRole("alert")).toHaveText(
    "Popraw błędy w formularzu (1).",
  );

  // 5. Przy polu „Kod pocztowy” pojawia się opis błędu.
  await expect(
    page.getByText("Kod pocztowy musi mieć format 00-000"),
  ).toBeVisible();

  // 6. Komunikat o udanym zapisie nie może się pojawić.
  await expect(page.getByText("Zapisano adres dostawy.")).toBeHidden();
});
