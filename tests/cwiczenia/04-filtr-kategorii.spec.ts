import { test, expect } from "@playwright/test";

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test("filtr „Dziecko” pokazuje tylko produkty dla dzieci", async ({ page }) => {
  await page.goto("http://localhost:4100/");
  await page.getByRole("link", { name: "Produkty" }).click();
  // Codegen nagrał etykietę razem z treścią listy („Kategoria WszystkieCiał...”), wystarczy sama etykieta.
  await page.getByLabel("Kategoria").selectOption("Dziecko");
  await page.getByRole("button", { name: "Filtruj" }).click();

  // Licznik pod filtrami pokazuje 3 produkty.
  await expect(page.getByText("Liczba produktów: 3")).toBeVisible();

  // Produkty dla dzieci są w tabeli. Szukamy w wierszach, bo te same nazwy mogą być też na kafelkach.
  await expect(page.getByRole("row").filter({ hasText: "Chusteczki nawilżane dla dzieci" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Szampon dla dzieci" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Krem ochronny dla dzieci" })).toBeVisible();

  // „Tylko”: w tabeli są dokładnie 3 wiersze produktów, tyle samo co w liczniku.
  // Wiersz produktu ma komórki (cell). Wiersz nagłówka ma nagłówki kolumn (columnheader), więc się nie liczy.
  const wierszeProduktow = page.getByRole("row").filter({ has: page.getByRole("cell") });
  await expect(wierszeProduktow).toHaveCount(3);

  // Każdy z tych wierszy ma w kolumnie „Kategoria” wartość „Dziecko”.
  const wierszeDziecko = wierszeProduktow.filter({ has: page.getByRole("cell", { name: "Dziecko", exact: true }) });
  await expect(wierszeDziecko).toHaveCount(3);

  // Produktu z kategorii Włosy nie ma w tabeli.
  await expect(page.getByRole("row").filter({ hasText: "Szampon nawilżający" })).toHaveCount(0);
});
