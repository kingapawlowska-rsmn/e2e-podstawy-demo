# Hotfix Mirka (ćwiczenie 12c): diagnoza i zgłoszenie

Mirek: „malutki hotfix, same kosmetyczne poprawki tekstów”. Wynik: **zmiany tekstów i jeden poważny błąd liczenia.**

## Wyniki uruchomień (lokalnie, wszystkie testy repo)

| Uruchomienie | Wynik |
|---|---|
| Przed hotfiksem (`main`) | **104 passed** |
| Hotfix (`APP_VERSION=hotfix`), testy bez zmian | **20 failed**, 79 passed |
| Hotfix, gałąź `hotfix-testy` (poprawione napisy) | **2 failed** (ten sam błąd sumy), 102 passed |
| Po powrocie na `main` bez hotfiksu | **104 passed** |

## Co zmienił hotfix

| Przed | Po hotfiksie | Gdzie |
|---|---|---|
| „Dodano do koszyka: …” | „Produkt w koszyku: …” | komunikat po dodaniu produktu |
| przycisk „Zapisz adres” | „Zapisz” | adres dostawy, Moje adresy |
| przycisk „Zastosuj kod” | „Użyj kodu” | koszyk |
| link „Pobierz fakturę” | „Faktura (HTML)” | strona zamówienia |
| status „Opłacone” | „Zapłacone” | panel admina, strona zamówienia |
| „Dostępny (N szt.)” | „Na stanie: N szt.” | karta produktu |
| „Niedostępny” | „Chwilowo brak” | karta produktu (tabela na stronie głównej bez zmian) |
| **suma „razem” w koszyku** | **dodaje ceny jednostkowe, pomija ilość** | **koszyk: błąd** |

## Tabela diagnozy

| Test (plik:linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| `projekt/p16-ilosc-z-karty.spec.ts:25` | oczekiwano „Pozycji: 1, razem: 959,76 zł”, jest „…39,99 zł” | aplikacja liczy źle: suma ignoruje ilość | **błąd do zgłoszenia** |
| `cwiczenia/08-biuro-mikolaja.spec.ts:11` | najpierw brak „Dodano do koszyka: …”; po poprawce brak „Pozycji: 1, razem: 399,90 zł” | zmieniony tekst **i** ten sam błąd sumy | tekst poprawiony, **błąd do zgłoszenia** |
| `cwiczenia/02-koszyk.spec.ts:6` | brak „Dodano do koszyka: Krem do twarzy na dzień” | zmieniony tekst komunikatu | test do poprawy |
| `cwiczenia/04-karta-produktu.spec.ts:7` | jak wyżej | zmieniony tekst komunikatu | test do poprawy |
| `cwiczenia/04-karta-produktu.spec.ts:67` | jak wyżej | zmieniony tekst komunikatu | test do poprawy |
| `cwiczenia/04-koszyk-usuwanie.spec.ts:6` | brak „Dodano do koszyka: Żel pod prysznic” | zmieniony tekst komunikatu | test do poprawy |
| `cwiczenia/06-platnosc-w-ramce.spec.ts:27` | brak „Dodano do koszyka: Maseczka glinkowa” | zmieniony tekst komunikatu | test do poprawy |
| `cwiczenia/04-adres-walidacja.spec.ts:6` | timeout, czeka na przycisk „Zapisz adres” | zmieniona etykieta: „Zapisz” | test do poprawy |
| `cwiczenia/08-zmiana-adresu.spec.ts:56` | timeout, czeka na „Zapisz adres” | zmieniona etykieta: „Zapisz” | test do poprawy |
| `review/03-adres-walidacja.spec.ts:7` | timeout, czeka na „Zapisz adres” | zmieniona etykieta: „Zapisz” | test do poprawy |
| `review/05-zmiana-adresu.spec.ts:6` | timeout, czeka na „Zapisz adres” | zmieniona etykieta: „Zapisz” | test do poprawy |
| `review/06-kod-rabatowy.spec.ts:6` | timeout, czeka na „Zastosuj kod” | zmieniona etykieta: „Użyj kodu” | test do poprawy |
| `polowanie/kod-wygasly-jesien10.spec.ts:21` | timeout, czeka na „Zastosuj kod” | zmieniona etykieta: „Użyj kodu” | test do poprawy |
| `projekt/p10-faktura-na-firme.spec.ts:40` | timeout, czeka na pobieranie po „Pobierz fakturę” | zmieniona nazwa linku: „Faktura (HTML)” | test do poprawy |
| `projekt/p15-status-w-panelu.spec.ts:13` | timeout przy wyborze „Opłacone” | zmieniona opcja: „Zapłacone” | test do poprawy |
| `czytanie/05-karta-produktu.spec.ts:13` | oczekiwano „Dostępny”, jest „Na stanie: 100 szt.” | zmieniony tekst dostępności | test do poprawy |
| `smoke.spec.ts:36` | oczekiwano „Dostępny”, jest „Na stanie: 100 szt.” | zmieniony tekst dostępności | test do poprawy |
| `czytanie/05-karta-produktu.spec.ts:26` | oczekiwano „Niedostępny”, jest „Chwilowo brak” | zmieniony tekst dostępności | test do poprawy |
| `polowanie/karta-produkt-niedostepny.spec.ts:11` (Maska) | brak tekstu „Niedostępny” | zmieniony tekst: „Chwilowo brak” | test do poprawy |
| `polowanie/karta-produkt-niedostepny.spec.ts:11` (Serum) | brak tekstu „Niedostępny” | zmieniony tekst: „Chwilowo brak” | test do poprawy |

Poprawki testów są na gałęzi `hotfix-testy` (commit „Testy pod hotfix: nowe etykiety”). Na `main` testy zostają bez zmian, bo hotfix nie jest wydany.

## Zgłoszenie dla Mirka

```
Tytuł: Suma „razem” w koszyku nie uwzględnia ilości produktów
Wersja: hotfix
Kroki:
1. Zaloguj się jako klient (user / user123) i opróżnij koszyk.
2. Otwórz kartę „Kalendarz adwentowy 2026”, w polu „Ilość” wpisz 24, kliknij „Dodaj do koszyka”.
3. Otwórz „Koszyk”.
Oczekiwany wynik: wiersz: 24 szt., wartość 959,76 zł; suma „Pozycji: 1, razem: 959,76 zł”
  (suma „razem” równa sumie kolumny „Wartość”).
Faktyczny wynik: wiersz poprawny (24 szt., 959,76 zł), ale suma „Pozycji: 1, razem: 39,99 zł”.
  Suma dodaje same ceny jednostkowe: 3 szampony + 2 płyny dają „razem: 19,98 zł” zamiast 52,95 zł.
  API /api/cart: subtotal_cents 95976, total_cents 3999.
Test: tests/projekt/p16-ilosc-z-karty.spec.ts › P16. Ilość z karty produktu › 24 kalendarze z karty
  produktu dają w koszyku wartość i sumę 959,76 zł (failed na hotfix, passed bez APP_VERSION).
  Ten sam błąd łapie tests/cwiczenia/08-biuro-mikolaja.spec.ts (10 kalendarzy, oczekiwane 399,90 zł).
Waga: wysoka. Klient widzi i płaci złą kwotę; to nie jest „kosmetyczna poprawka tekstów”.
```

**Potwierdzenie (druga osoba z pary):** `npx playwright test tests/projekt/p16` daje `1 failed` z `APP_VERSION=hotfix` i `1 passed` bez niego.

## Wnioski

- Z 29 testów projektu tylko P16 ma w koszyku więcej niż 1 sztukę i tylko on złapał błąd sumy. Wymaganie Bożeny z 13:00 („suma razem równa sumie kolumny Wartość”) okazało się trafione.
- Jedna zmiana tekstu („Dodano do koszyka” → „Produkt w koszyku”) wymagała poprawek w 5 plikach. Gdyby ten tekst był w jednym miejscu (funkcja pomocnicza albo Page Object), wystarczyłaby jedna poprawka.

## Dla szybszych: napisy w jednym miejscu

Na gałęzi `hotfix-testy` poprawki objęły **25 miejsc w 15 plikach**. Dlatego na `main` napisy, które zmienił hotfix, przenieśliśmy do jednego pliku `tests/pomocnicze/teksty.ts` (obiekt `TEKSTY`). Korzysta z niego 27 miejsc w 16 plikach testów.

| Sprawdzenie | Wynik |
|---|---|
| `main`, bez hotfixu, `teksty.ts` z obecnymi napisami | **104 passed** |
| hotfix, zmienione **tylko** 7 linii w `teksty.ts` | **102 passed, 2 failed** (P16 i 08-biuro, błąd sumy), tak samo jak na `hotfix-testy` |

Następna zmiana napisu wymaga więc poprawki w jednym pliku, a nie w kilkunastu.
