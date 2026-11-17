# Zasady pisania testów w tym repo

Repo szkoleniowe: aplikacja Namssor (`app/`, port 4100) i testy Playwright w TypeScript (`tests/`).
Testy czytają i oceniają testerzy, którzy dopiero uczą się kodu. Pisz prosto i czytelnie.

## Kod testu
- Importuj wyłącznie `import { test, expect } from '@playwright/test';`.
- Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.
- Lokatory w tej kolejności: `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`.
  Nie używaj selektorów CSS i XPath, `id` ani klas.
- Wiersz tabeli znajdź po treści: `page.getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Asercje web-first, które same czekają: `await expect(lokator).toBeVisible()`, `toHaveText`, `toHaveURL`.
- Nigdy `page.waitForTimeout()` ani stałych pauz. Nie sprawdzaj stanu przez `isVisible()` w `if`.
- Jeden test sprawdza jedno zachowanie. Nazwa testu po polsku opisuje oczekiwany wynik.
- Komentarze po polsku, krótkie: co robi krok i dlaczego, gdy to nieoczywiste.
- Testy API przez fixture `request`; sprawdzaj status i treść odpowiedzi.

## Uruchamianie
- `npx playwright test` (wszystkie), `npx playwright test <plik>` (jeden plik), `npm run test:smoke`.
- Playwright sam uruchamia aplikację (`webServer` w `playwright.config.ts`).
- Po zmianach: `npm run typecheck`. Polecenia mają działać w PowerShell 5.1 (bez `&&`).
- Stan bazy psuje się po testach zmieniających dane: `npm run db:reset` przy zatrzymanej aplikacji.

## Dane
- Konta demo: `user` / `user123` (klient), `admin` / `admin123` (administrator).
- Opis API: `app/openapi.json`, w przeglądarce http://localhost:4100/api/docs.
- Nie zmieniaj kodu aplikacji w `app/`, chyba że użytkownik wyraźnie o to prosi.

## Review i dane testowe
- Sprawdzaj efekt biznesowy akcji (status zamówienia, zapisane dane, treść komunikatu), a nie kolor, klasę CSS ani układ strony.
- Oczekiwane wartości (liczby, ceny, teksty) bierz z wymagania albo przypadku testowego, nigdy nie przepisuj ich ze strony.
- Test, który zmienia dane, ma sprzątać po sobie w `afterEach` albo tworzyć własne dane, żeby przechodził przy każdym uruchomieniu i nie zależał od innych testów.
- Do każdego zdania wymagania napisz asercję, która padnie, gdy akcja się nie uda; nie sprawdzaj elementów widocznych już przed akcją.
- Porównuj tekst dokładnie przez `toHaveText` i używaj tylko tekstów, które aplikacja naprawdę pokazuje, także w asercjach z `not` i `toBeHidden()`.
- Nie używaj `.first()`, `.nth()` ani `.last()`, jeśli nie wiesz, które elementy pasują; element w wierszu tabeli szukaj wewnątrz tego wiersza.
- Wymaganie klienta testuj na koncie `user`, a wymaganie administratora na koncie `admin`.
- Zanim oddasz test, pokaż, że potrafi paść, i zamiast „jestem pewien” podaj wynik uruchomienia.
