# Polowanie na błędy: wyniki pary tester04

Spotkanie „wydajemy czy nie”, 18.11.2026. Wynik końcowy: **9 zaliczonych błędów** (wszystkie, które da się znaleźć z konta klienta; dziesiąty jest w funkcjach administratora) i **6 niespodzianek**.

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
npx playwright test tests/polowanie        # rc: 10 failed (9 plików, test karty produktu ma 2 przypadki)
$env:BASE_URL="https://namssor-376292984721.europe-central2.run.app"
npx playwright test tests/polowanie        # wersja zwykła: 10 passed
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
| 7 | inne | aktywny „Dodaj do koszyka” na karcie produktu niedostępnego | `karta-produkt-niedostepny.spec.ts` |
| 8 | koszyk | po usunięciu ostatniej pozycji licznik „Pozycji: 1” | `koszyk-usuniecie-ostatniej-pozycji.spec.ts` |
| 9 | kody | wygasły kod `JESIEN10` przyjęty (-10%) | `kod-wygasly-jesien10.spec.ts` |

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
- **Na `rc`:** status 200 i pusty obiekt `{}`. Tak samo dla innych złych numerów: `zam-1046`, `ZAM-0`, `abc`.
- **Test:** API, tylko odczyt.

### 7. Karta produktu niedostępnego ma aktywny przycisk „Dodaj do koszyka”

- **Jak znaleźliśmy:** porównaliśmy na obu adresach atrybuty pól i przycisków (np. `disabled`), a nie tylko tekst stron.
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Otwórz kartę „Serum z witaminą C” (`/produkt/7`), stan 0. To samo dzieje się dla Maski do włosów i Dezodorantu.
- **Oczekiwane:** „Niedostępny” i wyłączony przycisk „Dodaj do koszyka”. To wymaganie z `tests/review/09-produkt-niedostepny.spec.ts`.
- **Na `rc`:** przycisk jest aktywny, chociaż pole „Ilość” jest wyłączone. Kliknięcie nic nie dodaje, bo serwer blokuje produkt bez stanu. W tabeli na stronie głównej przyciski są wyłączone poprawnie.
- **Test:** przeglądarka, tylko odczyt.
- **Tablica:** pierwsza wersja testu (tylko Serum, obszar „koszyk”) nie została rozpoznana. Zaliczona druga wersja, oparta na wymaganiu z `tests/czytanie/05-karta-produktu.spec.ts`: karta otwierana z kafelka, sprawdzane Maska do włosów i Serum, obszar „inne”. Ten gotowy test z repo też pada tylko na `rc`.
- **Wniosek na przyszłość:** warto uruchomić na `rc` gotowe testy z repo, bo pokazują wymagania, o których sami byśmy nie pomyśleli.

### 8. Po usunięciu ostatniej pozycji licznik koszyka pokazuje 1

- **Jak znaleźliśmy:** z podpowiedzi w ćwiczeniu („co, jeśli klient usunie ostatnią rzecz?”).
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Włóż do koszyka jeden produkt, np. „Mydło w kostce”.
  3. W koszyku kliknij „Usuń”.
- **Oczekiwane:** „Koszyk jest pusty.” i „Pozycji: 0, razem: 0,00 zł”.
- **Na `rc`:** „Koszyk jest pusty.”, ale licznik „Pozycji: 1, razem: 0,00 zł”. Dopiero odświeżenie strony pokazuje 0. Przy 2 i 3 pozycjach licznik po usunięciu jest poprawny, błąd dotyczy tylko ostatniej pozycji.
- **Test:** przeglądarka. Przed testem i po nim koszyk jest opróżniany.

### 9. Wygasły kod JESIEN10 jest przyjmowany

- **Jak znaleźliśmy:** w dokumentacji ćwiczeń (`docs/cwiczenia/extra-d1-przegladarki-i-dane.md`) jest opis kodu `JESIEN10` jako wygasłego. Nie było go w żadnym naszym teście.
- **Odtworzenie krok po kroku:**
  1. Zaloguj się kontem pary.
  2. Włóż do koszyka „Szampon nawilżający” (12,99 zł).
  3. Wpisz kod `JESIEN10` i kliknij „Zastosuj kod”.
- **Oczekiwane:** komunikat „Kod JESIEN10 wygasł 31.10.2026.”, bez rabatu, suma 12,99 zł.
- **Na `rc`:** „Kod JESIEN10 przyjęty: -10% na całe zamówienie.”, suma 11,69 zł. Wielkość liter i data podana w nagłówku `X-Namssor-Teraz` nie mają znaczenia.
- **Test:** przeglądarka. Przed testem i po nim koszyk jest opróżniany.

## Niespodzianki Klaudiusza (te same na obu adresach)

| # | Flaga | Gdzie |
|---|---|---|
| 1 | `FLAGA-B38N2` | strona „Nie znaleziono strony” (404) |
| 2 | `FLAGA-9R6VC` | ukryty endpoint z komentarza HTML |
| 3 | `FLAGA-ZN6MD` | `/api/promocja` z datą po Czarnym Piątku |
| 4 | `FLAGA-RV9AY` | ukryty produkt „Kalendarz adwentowy 2025” |
| 5 | `FLAGA-XLTK7` | kod rabatowy `KLAUDIUSZ` |
| 6 | `FLAGA-WUR7S` | „Tryb Klaudiusza”: 5 kliknięć w logo |

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

### 6. `FLAGA-WUR7S`: Tryb Klaudiusza

- **Krok po kroku:** na dowolnej stronie sklepu kliknij 5 razy w logo „namssor” w lewym górnym rogu, w ciągu 10 sekund.
- **Co widać:** na górze strony pojawia się „Tryb Klaudiusza: wszystkie testy są zielone. Jestem pewien, że to działa.”, a pod spodem „Flaga: FLAGA-WUR7S”. Flaga przychodzi z adresu `/tryb-klaudiusza`.
- **Jak znaleźliśmy:** porównaliśmy skrypty, które serwer wysyła do przeglądarki (to dalej czarna skrzynka, bo każdy widzi je w DevTools). W skrypcie strony był licznik kliknięć w logo.

## Co sprawdziliśmy i działa tak samo na obu adresach

- wyszukiwarka, filtr kategorii, sortowanie po nazwie, karty produktów
- logowanie: puste pola, złe hasło, przekierowanie po zalogowaniu
- kody `CZARNY20` i `WLOSY15`, nieznany kod, pusty kod
- walidacja ilości w koszyku (0, −1, 1,5, 1001), produkt niedostępny, nieistniejący produkt
- walidacja telefonu, długości nazwy i ulicy, pustych pól w adresach; walidacja adresu głównego
- NIP w zamówieniu firmowym (za krótki, zła suma kontrolna, pusty), zamówienie z koszyka z fakturą
- zamówienie jednego produktu `POST /api/orders`: ilość 0, 11 i 10,5, produkt niedostępny i nieistniejący, cena promocyjna w zamówieniu
- płatność kartą w ramce: karta przyjęta, karta odrzucona
- widok „Moje zamówienia” i szczegóły zamówienia
- kody rabatowe w różnych dniach (nagłówek `X-Namssor-Teraz`), `WLOSY15` bez produktów do włosów, zmiana kodu, przeliczenie po dodaniu produktu
- odliczanie do promocji dzień po dniu, z poprawną odmianą „dni / dzień / dni”
- wyszukiwarka i filtr kategorii w API i na stronie: wielkie litery, polskie znaki, spacje
- stan magazynu po zamówieniu (`/api/orders`, zamówienie firmowe, zamówienie z koszyka), dostęp do cudzych zamówień (404)
- logowanie przez API (wielkość liter, spacje, brak pól), token, przekierowanie `next` (także na obcą stronę), wylogowanie
- nazwa adresu z HTML (`<b>`) jest wyświetlana jako tekst, a nie wykonywana
- skrypty wysyłane do przeglądarki są identyczne na obu adresach
- scenariusze z `docs/projekt.md` dostępne dla klienta: P1, P2, P4, P5, P6, P9–P14 i P16. Różnią się tylko przez znany błąd nr 2: w P9 i P16 krem kosztuje w koszyku 21,11 zł zamiast 26,39 zł
- daty zamówienia, szczegółów i faktury oraz „dzisiejsza” data promocji
- faktura pobierana z przeglądarki (`/zamowienia/[numer]/faktura`); ma ten sam błąd NIP co błąd nr 5

## Obserwacje bez punktu (na obu adresach)

- Do koszyka można włożyć więcej sztuk, niż jest na stanie, np. 1000 sztuk mydła przy 200 na stanie.
- W koszyku można zapłacić kartą przy kwocie 0,00 zł.
- Złożenie zamówienia z koszyka z 1000 sztuk (więcej niż stan) zwraca 201, ale zamówienie nie powstaje.
- Bramka płatności przyjmuje kartę z błędną cyfrą kontrolną (`4111 1111 1111 1112`).
- Znaki `%` i `_` w wyszukiwarce działają jak „dowolny tekst”: `%` zwraca wszystkie 21 produktów.

## Co zostało

- **Błąd #10:** nikt go jeszcze nie znalazł.
  - Statusów zamówień nie da się sprawdzić z konta pary: na serwerach działają tylko konta `tester01`–`tester12`, a `admin` / `admin123` nie loguje się. Według `docs/projekt.md` hasło do konta `admin` na serwerze zna tylko trener.
  - Pakiet nie sprawdza na `rc` scenariuszy administratora: P3 (dodanie produktu), P8 (anulowanie w panelu), P15 (status w panelu) i części P7. Jeśli w `rc` są tam błędy, nasz pakiet ich nie zobaczy, a o wydaniu trzeba zdecydować razem z tym ryzykiem.
  - W przeglądarce sprawdziliśmy jeszcze kartę produktu z ilością, „Usuń” w koszyku, zmianę adresu głównego, przyciski „Ustaw jako domyślny” i „Usuń” w „Moich adresach” oraz zamówienie z błędnym NIP. Wszystko działa tak samo na obu adresach, poza znanym błędem nr 4 (adres domyślny).
