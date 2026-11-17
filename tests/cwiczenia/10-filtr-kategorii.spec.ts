import { test, expect } from "@playwright/test";

// Ćwiczenie 10: test napisany skillem /test-e2e.
// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty.

test("filtr kategorii Dziecko pokazuje dokładnie 3 produkty", async ({ page }) => {
  // Strona produktów nie wymaga logowania.
  await page.goto("http://localhost:4100/");

  await page.getByLabel("Kategoria").selectOption("Dziecko");
  await page.getByRole("button", { name: "Filtruj" }).click();

  // Liczymy tylko wiersze tabeli, bo te same produkty są też na kartach „Oferta na Czarny Piątek”.
  // Wiersz produktu ma komórki (cell), wiersz nagłówka ma nagłówki kolumn, więc się nie liczy.
  // Bez filtra tabela ma 21 wierszy, więc asercja padnie, gdy filtr nie zadziała.
  const wierszeProduktow = page.getByRole("table").getByRole("row").filter({ has: page.getByRole("cell") });
  await expect(wierszeProduktow).toHaveCount(3);

  // Licznik nad tabelą pokazuje tę samą liczbę.
  await expect(page.getByText("Liczba produktów:")).toHaveText("Liczba produktów: 3");
});
