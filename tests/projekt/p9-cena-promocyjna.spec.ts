import { test, expect } from "@playwright/test";
import { zaloguj } from "../pomocnicze/logowanie";

// Projekt P9: ta sama cena promocyjna w trzech miejscach (kafelek, karta produktu, koszyk).
// Wartości ze scenariusza: stara cena 32,99 zł (przekreślona), nowa 26,39 zł, plakietka -20%.
// Przekreśloną cenę aplikacja pokazuje znacznikiem <s> z data-testid „…-old-price”.
// <s> nie ma roli ani etykiety, dlatego tu (wyjątkowo) getByTestId.
// Przekreślenie jest wprost w wymaganiu, więc sprawdzamy je przez styl text-decoration-line.

const produkt = "Krem do twarzy na dzień";

test.describe("P9. Cena promocyjna kremu do twarzy", () => {
  test.afterEach(async ({ page }) => {
    // Sprzątanie: usuń krem z koszyka, żeby koszyk konta wrócił do stanu sprzed testu.
    // Gdy test padnie przed dodaniem kremu, przycisku nie będzie i tu pojawi się drugi błąd.
    // Właściwą przyczynę pokazuje wtedy pierwszy błąd w raporcie.
    await page.goto("/koszyk");
    await page.getByRole("button", { name: `Usuń: ${produkt}` }).click();
    await expect(
      page.getByRole("row").filter({ hasText: produkt }),
    ).toHaveCount(0);
  });

  test("kafelek, karta produktu i koszyk pokazują cenę 26,39 zł zamiast 32,99 zł", async ({
    page,
  }) => {
    await zaloguj(page);
    await page.goto("/");

    // 1. Kafelek na stronie „Produkty”
    const kafelek = page.getByRole("article", { name: produkt });
    await expect(kafelek.getByTestId("tile-old-price")).toHaveText("32,99 zł");
    await expect(kafelek.getByTestId("tile-old-price")).toHaveCSS("text-decoration-line", "line-through");
    await expect(kafelek.getByTestId("tile-price")).toHaveText("26,39 zł");
    await expect(kafelek.getByText("-20%", { exact: true })).toBeVisible();

    // 2. Karta produktu: wejście przez link z nazwą na kafelku
    await kafelek.getByRole("link", { name: produkt }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(produkt);
    const karta = page.getByRole("article");
    await expect(karta.getByTestId("product-old-price")).toHaveText("32,99 zł");
    await expect(karta.getByTestId("product-old-price")).toHaveCSS("text-decoration-line", "line-through");
    await expect(karta.getByTestId("product-price")).toHaveText("26,39 zł");
    await expect(karta.getByText("-20%", { exact: true })).toBeVisible();

    // 3. Dodanie do koszyka z karty; po dodaniu adres zawiera „dodano=”
    await karta.getByRole("button", { name: "Dodaj do koszyka" }).click();
    await expect(page).toHaveURL(/dodano=/);

    // 4. Koszyk: komórka ceny w wierszu kremu.
    // Wartość pozycji (ostatnia kolumna) też może wynosić 26,39 zł, dlatego sprawdzamy kolumnę ceny.
    // Scenariusz wymaga tu tylko 26,39 zł, ale komórka zawiera też starą cenę i plakietkę,
    // a toHaveText porównuje cały tekst. Wszystkie trzy wartości pochodzą ze scenariusza P9.
    await page.goto("/koszyk");
    const wiersz = page.getByRole("row").filter({ hasText: produkt });
    await expect(wiersz.getByTestId("cart-item-price")).toHaveText(
      "32,99 zł 26,39 zł -20%",
    );
  });
});
