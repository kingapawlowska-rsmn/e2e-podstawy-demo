# Polowanie na błędy: wyniki pary tester04

Spotkanie „wydajemy czy nie”, 18.11.2026. Stan tablicy o 10:22: **1. miejsce, 14 punktów, 6 błędów i 4 niespodzianki** (piąta niespodzianka zgłoszona później).

## Jak szukaliśmy

1. **Czarna skrzynka.** Nie czytaliśmy kodu w `app/`. Źródła: przeglądarka, `/api/docs`, `/api/openapi.json` i odpowiedzi API.
2. **Te same kroki na dwóch adresach.** Każde żądanie wysyłaliśmy na `rc` i na wersję zwykłą, potem porównywaliśmy odpowiedzi.
   - Różnica tylko na `rc` to **błąd**.
   - To samo na obu adresach to **niespodzianka** albo zwykłe działanie.
3. **Najpierw strony bez logowania, potem konto pary.** Na koncie pary sprawdzaliśmy koszyk, adresy, zamówienia i fakturę. Po każdej próbie sprzątaliśmy koszyk i adresy.
4. **Dowód testem.** Na każdy błąd jest test w `tests/polowanie/`. Test pada na `rc`, przechodzi na wersji zwykłej, a dwa uruchomienia z rzędu dają ten sam wynik.

### Polecenia do pokazania dowodu (PowerShell)

```powershell
$env:APP_USER="tester04"
$env:APP_PASSWORD="czarny-piatek-2026"
$env:BASE_URL="https://namssor-rc-376292984721.europe-central2.run.app"
npx playwright test tests/polowanie        # rc: 6 failed
$env:BASE_URL="https://namssor-376292984721.europe-central2.run.app"
npx playwright test tests/polowanie        # wersja zwykła: 6 passed
```

## Błędy (tylko na `rc`)

| # | Obszar | Błąd | Test |
|---|---|---|---|
| 1 | sortowanie | sortowanie po cenie porównuje ceny jak tekst | `sortowanie-po-cenie.spec.ts` |
| 2 | koszyk | promocja w koszyku liczona dwa razy | `koszyk-cena-promocyjna.spec.ts` |
| 3 | walidacja | adres w profilu przyjmuje zły kod pocztowy | `adres-kod-pocztowy.spec.ts` |
| 4 | adresy | nowy adres staje się domyślny | `adres-domyslny.spec.ts` |
| 5 | faktura | NIP sprzedawcy zamiast NIP nabywcy | `faktura-nip-nabywcy.spec.ts` |
| 6 | API | 200 zamiast 404 dla nieistniejącego zamówienia | `api-zamowienie-nieistniejace.spec.ts` |

### 1. Sortowanie „Cena: od najniższej” porównuje ceny jak tekst

- **Jak znaleźliśmy:** porównaliśmy kolejność produktów na stronie głównej dla każdej opcji sortowania. Na `rc` kolejność różniła się przy sortowaniu po cenie (w obie strony). Sortowanie po nazwie było takie samo na obu adresach.
- **Odtworzenie krok po kroku:**
  1. Otwórz stronę główną (bez logowania).
  2. W polu „Sortuj” wybierz „Cena: od najniższej”.
  3. Kliknij „Filtruj”.
- **Oczekiwane:** pierwszy jest „Mydło w kostce” za 4,99 zł.
- **Na `rc`:** pierwszy jest „Szampon dla dzieci” za 10,99 zł. „10,99” trafia przed „4,99”, tak jak przy porównywaniu tekstu. To samo dzieje się w `/api/catalog?sort=cena`.
- **Test:** przeglądarka. Sprawdza nazwę i cenę w pierwszym wierszu tabeli.
- **Tablica:** Błąd #5. Zgłosiliśmy go jako drugi, pierwsza była para tester02.

### 2. Koszyk nalicza promocję dwa razy

- **Jak znaleźliśmy:** dodaliśmy do koszyka produkt w promocji i porównaliśmy cenę w koszyku z ceną w katalogu.
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Dodaj do koszyka „Odżywkę do włosów” (cena regularna 14,99 zł, promocja −20%).
  3. Otwórz „Koszyk”.
- **Oczekiwane:** 11,99 zł za sztukę, tak jak w katalogu.
- **Na `rc`:** 9,59 zł za sztukę (14,99 zł × 0,8 × 0,8). Przez to kody rabatowe i suma koszyka też są liczone od złej kwoty.
- **Test:** API. Opróżnia koszyk przed testem i po nim, dodaje produkt id 2 i sprawdza `unit_price_cents: 1199`.

### 3. Adres w profilu przyjmuje zły kod pocztowy

- **Jak znaleźliśmy:** wysłaliśmy do `POST /api/account/addresses` wartości graniczne każdego pola (kod, telefon, długość nazwy i ulicy, puste pola).
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Dodaj adres z kodem pocztowym `01234`. Ten sam efekt dają `ab-cde` i `01-2345`.
- **Oczekiwane:** status 400 i komunikat „Kod pocztowy musi mieć format 00-000”.
- **Na `rc`:** status 201 i adres zapisany. Adres główny (`/api/account/address`) jest walidowany poprawnie.
- **Test:** API. Po teście usuwa wszystkie dodatkowe adresy.

### 4. Nowy adres w profilu staje się domyślny

- **Jak znaleźliśmy:** po dodaniu kilku adresów lista na `rc` miała gwiazdkę „domyślny” przy ostatnim adresie, a nie przy adresie głównym.
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Upewnij się, że domyślny jest „Adres główny”.
  3. Dodaj adres „Praca”.
- **Oczekiwane:** domyślny dalej jest „Adres główny”. Domyślny zmienia się tylko przez „Ustaw adres domyślny”.
- **Na `rc`:** domyślny jest „Praca”, a przy kolejnym dodaniu każdy nowy adres.
- **Test:** API. Przed testem i po nim ustawia „Adres główny” jako domyślny i usuwa dodatkowe adresy.

### 5. Faktura ma NIP sprzedawcy zamiast NIP nabywcy

- **Jak znaleźliśmy:** złożyliśmy zamówienie na firmę i porównaliśmy fakturę (`/api/orders/{numer}/invoice`) na obu adresach.
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Złóż zamówienie firmowe z NIP `241-224-12-28` i firmą „Firma Test”.
  3. Pobierz fakturę.
- **Oczekiwane:** nabywca to „Firma Test” z NIP `2412241228`.
- **Na `rc`:** nabywca ma NIP `1234563218`, czyli NIP sprzedawcy (Namssor). Szczegóły zamówienia pokazują poprawny NIP, błędny jest tylko dokument faktury.
- **Test:** API. Tworzy własne zamówienie firmowe na 1 sztukę i sprawdza `buyer`.

### 6. API zwraca 200 dla zamówienia, którego nie ma

- **Jak znaleźliśmy:** pytaliśmy API o rzeczy, których nie ma (podpowiedź z ćwiczenia: „Co pokazuje API, gdy poprosi o coś, czego nie ma?”).
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Wyślij `GET /api/orders/ZAM-9999`.
- **Oczekiwane:** status 404 i treść `{ "error": "Nie ma takiego zamówienia" }`.
- **Na `rc`:** status 200 i pusty obiekt `{}`.
- **Test:** API, tylko odczyt.

## Niespodzianki Klaudiusza (te same na obu adresach)

| # | Flaga | Gdzie |
|---|---|---|
| 1 | `FLAGA-B38N2` | strona „Nie znaleziono strony” (404) |
| 2 | `FLAGA-9R6VC` | ukryty endpoint z komentarza HTML |
| 3 | `FLAGA-ZN6MD` | `/api/promocja` z datą po Czarnym Piątku |
| 4 | `FLAGA-RV9AY` | ukryty produkt „Kalendarz adwentowy 2025” |
| 5 | `FLAGA-XLTK7` | kod rabatowy `KLAUDIUSZ` |

### 1. `FLAGA-B38N2`: strona 404

- **Krok po kroku:** wejdź na dowolny nieistniejący adres, np. `/nie-ma-takiej-strony`.
- **Co widać:** pod „Wróć do sklepu” jest tekst „Mirek: „U mnie działa”. Flaga: FLAGA-B38N2”.
- **Jak znaleźliśmy:** szukaliśmy tekstu „FLAGA” w odpowiedziach typowych adresów (`/robots.txt`, `/sitemap.xml`). Wszystkie zwracały stronę 404 z flagą.

### 2. `FLAGA-9R6VC`: wymagania Bożeny

- **Krok po kroku:**
  1. Na dowolnej stronie wyświetl źródło strony (Ctrl+U).
  2. Znajdź komentarz: „TODO(Bożena): wymagania na Czarny Piątek (wersja robocza) są pod /api/bozena/wymagania. Nie pokazywać klientom.”
  3. Otwórz `/api/bozena/wymagania`.
- **Co widać:** JSON z „wymaganiem” Bożeny i polem `"flaga": "FLAGA-9R6VC"`. Tekst wymagania jest inny na każdym adresie, flaga jest ta sama. Endpointu nie ma w dokumentacji API.

### 3. `FLAGA-ZN6MD`: promocja po terminie

- **Krok po kroku:** wyślij `GET /api/promocja` z nagłówkiem `X-Namssor-Teraz: 2026-11-28`, czyli z datą po 27.11.
- **Co widać:** komunikat „Bożena: przesuwamy na poniedziałek.” i `"flag": "FLAGA-ZN6MD"`.
- **Jak znaleźliśmy:** `/api/docs` opisuje nagłówek, który podmienia „dzisiejszą” datę. Sprawdziliśmy daty graniczne: dzień przed startem, dzień startu, dzień po starcie i nowy rok.

### 4. `FLAGA-RV9AY`: ukryty produkt

- **Krok po kroku:** otwórz `/produkt/22`, ewentualnie wpisz „2025” w wyszukiwarce na stronie głównej.
- **Co widać:** karta produktu „Kalendarz adwentowy 2025” z tekstem „Flaga: FLAGA-RV9AY”.
- **Jak znaleźliśmy:** `/api/products` kończy się na id 21. Zapytaliśmy o kolejne numery: `/api/products/22` istnieje, chociaż produktu nie ma na liście ani w `/api/catalog`.

### 5. `FLAGA-XLTK7`: kod rabatowy KLAUDIUSZ

- **Krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Dodaj dowolny produkt do koszyka.
  3. Wpisz kod rabatowy `KLAUDIUSZ`.
- **Co widać:** „Kod KLAUDIUSZ przyjęty: rabat 100% pewności. Jestem pewien, że to działa.”, suma 0,00 zł i w odpowiedzi API `"flag": "FLAGA-XLTK7"`.
- **Jak znaleźliśmy:** jako kody rabatowe wpisywaliśmy imiona osób z treści zadania.
- **Sprzątanie:** po próbie koszyk opróżniony („Usuń kod” i usunięcie produktów).

## Co sprawdziliśmy i działa tak samo na obu adresach

- wyszukiwarka, filtr kategorii, sortowanie po nazwie, karty produktów
- logowanie: puste pola, złe hasło, przekierowanie po zalogowaniu
- kody `CZARNY20` i `WLOSY15`, nieznany kod, pusty kod
- walidacja ilości w koszyku (0, −1, 1,5, 1001), produkt niedostępny, nieistniejący produkt
- walidacja telefonu, długości nazwy i ulicy, pustych pól w adresach; walidacja adresu głównego
- NIP w zamówieniu firmowym (za krótki, zła suma kontrolna, pusty), zamówienie z koszyka z fakturą
- płatność kartą w ramce: karta przyjęta, karta odrzucona
- widok „Moje zamówienia” i szczegóły zamówienia

## Obserwacje bez punktu (na obu adresach)

- Do koszyka można włożyć więcej sztuk, niż jest na stanie, np. 1000 sztuk mydła przy 200 na stanie.
- W koszyku można zapłacić kartą przy kwocie 0,00 zł.

## Co zostało

- **Błąd #10:** nikt go jeszcze nie znalazł. Najpewniej jest w statusach zamówień (Nowe → Opłacone → Wysłane, anulowanie). Do sprawdzenia potrzebne jest konto `admin`, czekamy na zgodę trenera.
