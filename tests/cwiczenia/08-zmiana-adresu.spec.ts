import { test, expect } from "@playwright/test";
import { TEKSTY } from "../pomocnicze/teksty";

// Zmiana adresu dostawy: scenariusz poprawny i trzy przypadki z tabeli Przykłady.
// Scenariusze: docs/scenariusze/zmiana-adresu.md i docs/scenariusze/zmiana-adresu.feature

test.describe("Zmiana adresu dostawy", () => {
  // Wszystkie testy zmieniają adres tego samego konta user,
  // więc muszą iść jeden po drugim, a nie równolegle.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Zaloguj się jako klient.
    await page.goto("/logowanie");
    await page.getByRole("textbox", { name: "Login" }).fill("user");
    await page.getByRole("textbox", { name: "Hasło" }).fill("user123");
    await page.getByRole("button", { name: "Zaloguj" }).click();
    await expect(page.getByText("Zalogowano jako user (user)")).toBeVisible();

    // Otwórz „Adres dostawy” z menu.
    await page.getByRole("link", { name: "Adres dostawy" }).click();
    await expect(
      page.getByRole("heading", { name: "Zmiana adresu dostawy" }),
    ).toBeVisible();

    // Warunek wstępny: pola zawierają adres startowy.
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Przykładowa 12/3",
    );
    await expect(page.getByRole("textbox", { name: "Kod pocztowy" })).toHaveValue(
      "00-001",
    );
    await expect(page.getByRole("textbox", { name: "Miasto" })).toHaveValue(
      "Warszawa",
    );
    await expect(page.getByRole("textbox", { name: "Telefon" })).toHaveValue(
      "500 100 200",
    );
  });

  test.afterEach(async ({ page }) => {
    // Przywróć adres startowy, żeby kolejne testy widziały ten sam stan.
    // Działa także wtedy, gdy test się nie powiódł.
    await page.goto("/konto/adres");
    await page
      .getByRole("textbox", { name: "Ulica i numer" })
      .fill("ul. Przykładowa 12/3");
    await page.getByRole("textbox", { name: "Kod pocztowy" }).fill("00-001");
    await page.getByRole("textbox", { name: "Miasto" }).fill("Warszawa");
    await page.getByRole("textbox", { name: "Telefon" }).fill("500 100 200");
    await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Zapisano adres dostawy.",
    );
  });

  test("zapisuje poprawny adres i zachowuje go po odświeżeniu strony", async ({
    page,
  }) => {
    // Wpisz nowy adres i zapisz.
    await page.getByRole("textbox", { name: "Ulica i numer" }).fill("ul. Lipowa 7");
    await page.getByRole("textbox", { name: "Kod pocztowy" }).fill("31-001");
    await page.getByRole("textbox", { name: "Miasto" }).fill("Kraków");
    await page.getByRole("textbox", { name: "Telefon" }).fill("600 200 300");

    // Pola pokazują wpisane wartości.
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Lipowa 7",
    );
    await expect(page.getByRole("textbox", { name: "Kod pocztowy" })).toHaveValue(
      "31-001",
    );
    await expect(page.getByRole("textbox", { name: "Miasto" })).toHaveValue(
      "Kraków",
    );
    await expect(page.getByRole("textbox", { name: "Telefon" })).toHaveValue(
      "600 200 300",
    );

    await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();

    await expect(page.getByRole("status")).toHaveText("Zapisano adres dostawy.");

    // Po odświeżeniu pola pokazują adres zapisany na koncie, a nie wpisany w przeglądarce.
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Lipowa 7",
    );
    await expect(page.getByRole("textbox", { name: "Kod pocztowy" })).toHaveValue(
      "31-001",
    );
    await expect(page.getByRole("textbox", { name: "Miasto" })).toHaveValue(
      "Kraków",
    );
    await expect(page.getByRole("textbox", { name: "Telefon" })).toHaveValue(
      "600 200 300",
    );
  });

  test("nie zapisuje adresu z kodem pocztowym bez myślnika", async ({ page }) => {
    const kodPocztowy = page.getByRole("textbox", { name: "Kod pocztowy" });

    // Zmień tylko kod pocztowy, resztę zostaw.
    await kodPocztowy.fill("31001");
    await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();

    // Podsumowanie błędów nad formularzem.
    await expect(page.getByRole("alert")).toHaveText(
      "Popraw błędy w formularzu (1).",
    );
    // Komunikat błędu należy do opisu tego pola, więc dotyczy właśnie jego.
    await expect(kodPocztowy).toHaveAccessibleDescription(
      /Kod pocztowy musi mieć format 00-000/,
    );
    await expect(page.getByText("Zapisano adres dostawy.")).toBeHidden();

    // Po ponownym otwarciu strony na koncie nadal jest cały adres startowy.
    await page.getByRole("link", { name: "Adres dostawy" }).click();
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Przykładowa 12/3",
    );
    await expect(kodPocztowy).toHaveValue("00-001");
    await expect(page.getByRole("textbox", { name: "Miasto" })).toHaveValue(
      "Warszawa",
    );
    await expect(page.getByRole("textbox", { name: "Telefon" })).toHaveValue(
      "500 100 200",
    );
  });

  test("nie zapisuje adresu z za krótkim numerem telefonu", async ({ page }) => {
    const telefon = page.getByRole("textbox", { name: "Telefon" });

    // Zmień tylko telefon, resztę zostaw.
    await telefon.fill("12345");
    await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();

    // Podsumowanie błędów nad formularzem.
    await expect(page.getByRole("alert")).toHaveText(
      "Popraw błędy w formularzu (1).",
    );
    // Komunikat błędu należy do opisu tego pola, więc dotyczy właśnie jego.
    await expect(telefon).toHaveAccessibleDescription(
      /Telefon musi mieć 9 cyfr \(opcjonalnie z \+48\)/,
    );
    await expect(page.getByText("Zapisano adres dostawy.")).toBeHidden();

    // Po ponownym otwarciu strony na koncie nadal jest cały adres startowy.
    await page.getByRole("link", { name: "Adres dostawy" }).click();
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Przykładowa 12/3",
    );
    await expect(page.getByRole("textbox", { name: "Kod pocztowy" })).toHaveValue(
      "00-001",
    );
    await expect(page.getByRole("textbox", { name: "Miasto" })).toHaveValue(
      "Warszawa",
    );
    await expect(telefon).toHaveValue("500 100 200");
  });

  test("nie zapisuje adresu bez miasta", async ({ page }) => {
    const miasto = page.getByRole("textbox", { name: "Miasto" });

    // Wyczyść pole Miasto, resztę zostaw.
    await miasto.fill("");
    await page.getByRole("button", { name: TEKSTY.zapiszAdres, exact: true }).click();

    // Podsumowanie błędów nad formularzem.
    await expect(page.getByRole("alert")).toHaveText(
      "Popraw błędy w formularzu (1).",
    );
    // Komunikat błędu należy do opisu tego pola, więc dotyczy właśnie jego.
    await expect(miasto).toHaveAccessibleDescription(/Podaj miasto/);
    await expect(page.getByText("Zapisano adres dostawy.")).toBeHidden();

    // Po ponownym otwarciu strony na koncie nadal jest cały adres startowy.
    await page.getByRole("link", { name: "Adres dostawy" }).click();
    await expect(page.getByRole("textbox", { name: "Ulica i numer" })).toHaveValue(
      "ul. Przykładowa 12/3",
    );
    await expect(page.getByRole("textbox", { name: "Kod pocztowy" })).toHaveValue(
      "00-001",
    );
    await expect(miasto).toHaveValue("Warszawa");
    await expect(page.getByRole("textbox", { name: "Telefon" })).toHaveValue(
      "500 100 200",
    );
  });
});
