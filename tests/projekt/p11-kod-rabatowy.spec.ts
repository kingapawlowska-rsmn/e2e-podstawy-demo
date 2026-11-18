import { test, expect } from "@playwright/test";
import { zaloguj } from "../pomocnicze/logowanie";

// Projekt P11: kod rabatowy w koszyku z „Mydłem w kostce”.
// Wszystkie testy używają jednego koszyka konta, więc biegną po kolei, nie równolegle.
test.describe.configure({ mode: "serial" });

const produkt = "Mydło w kostce";

test.describe("P11. Kod rabatowy w koszyku", () => {
  test.beforeEach(async ({ page }) => {
    // Przygotowanie: klient ma w koszyku tylko mydło.
    await zaloguj(page);
    // Pusty koszyk na start (DELETE /api/cart usuwa produkty i kod), żeby znać kwoty rabatu.
    // page.request wysyła ciasteczko sesji zalogowanej przeglądarki.
    const oproznienie = await page.request.delete("/api/cart");
    expect(oproznienie.status()).toBe(200);
    await page.goto("/");
    await page.getByRole("button", { name: `Dodaj do koszyka: ${produkt}` }).click();
    await expect(page).toHaveURL(/dodano=/);
    await page.goto("/koszyk");
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: usuń kod i mydło. DELETE /api/cart działa także wtedy,
    // gdy kod nie został przyjęty albo test padł przed dodaniem mydła.
    const oproznienie = await page.request.delete("/api/cart");
    expect(oproznienie.status()).toBe(200);
  });

  test("kod CZARNY20 zostaje przyjęty i koszyk pokazuje rabat", async ({ page }) => {
    // Enter zatwierdza formularz kodu niezależnie od napisu na przycisku.
    await page.getByLabel("Kod rabatowy").fill("CZARNY20");
    await page.getByLabel("Kod rabatowy").press("Enter");

    await expect(page.getByText("Kod CZARNY20 przyjęty: -20% na całe zamówienie.", { exact: true })).toBeVisible();
    // W koszyku jest tylko mydło za 4,99 zł (cena katalogowa), rabat 20% to 1,00 zł (po zaokrągleniu).
    await expect(page.getByText(/^Przed rabatem:/)).toHaveText("Przed rabatem: 4,99 zł, rabat (CZARNY20): -1,00 zł");
  });

  test("nieistniejący kod NIEMA daje komunikat błędu i nie nalicza rabatu", async ({ page }) => {
    await page.getByLabel("Kod rabatowy").fill("NIEMA");
    await page.getByLabel("Kod rabatowy").press("Enter");

    await expect(page.getByRole("alert")).toHaveText("Nie ma takiego kodu rabatowego: NIEMA");
    // Linia „Przed rabatem: …” pojawia się tylko przy przyjętym kodzie.
    await expect(page.getByText(/^Przed rabatem:/)).toHaveCount(0);
  });

  test("kod WLOSY15 bez produktów z kategorii Włosy daje komunikat o kategorii", async ({ page }) => {
    await page.getByLabel("Kod rabatowy").fill("WLOSY15");
    await page.getByLabel("Kod rabatowy").press("Enter");

    await expect(page.getByRole("alert")).toHaveText(
      "Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.",
    );
  });
});
