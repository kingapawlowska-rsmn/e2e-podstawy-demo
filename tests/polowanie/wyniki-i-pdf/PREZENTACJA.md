# Wydajemy czy nie? Para tester04 i tester01

5 minut przy rzutniku. Układ z `docs/projekt.md`. Jak pokazać każdy punkt na żywo: `KROK-PO-KROKU.md`.

## 1. Co pokrywa pakiet (1,5 min)

- **16 scenariuszy (P1–P16), 29 testów** w `tests/projekt/`:
  - 14 testów API: P5, P6, P7, P13, P14;
  - 15 testów E2E, z czego P8 i P15 łączą API z przeglądarką.
- Obszary: zakup i zamówienia, koszyk, ceny promocyjne, kody rabatowe, faktura na firmę, adresy w profilu, uprawnienia (klient i administrator), odliczanie do Czarnego Piątku.
- Lokalnie pakiet jest zielony: `29 passed`, także przy drugim uruchomieniu pod rząd (testy sprzątają po sobie).
- **Zmiana wymagań z 13:00 (ćwiczenie 12b) jest już w pakiecie.** P13 sprawdza daty 26.11 (został 1 dzień) i 27.11 (promocja trwa), P16 sprawdza 24 kalendarze za 959,76 zł. Zmieniliśmy istniejące pliki, bez nowych, a w historii gita jest osobny commit „Projekt P13 i P16: zmiana wymagań Bożeny z 13:00”.
- Każdy test pokazał, że potrafi paść: zmiana jednej oczekiwanej wartości dawała `failed`.
- **Czego pakiet nie sprawdza na `rc`:**
  - scenariuszy administratora i Biura Mikołaja (P1, P3, P6–P8, P10, P14, P15), bo hasło konta `admin` na serwerze zna tylko trener.

## 2. Co znaleźliśmy (2 min)

**9 błędów `rc`**, każdy z testem w `tests/polowanie/`. Na `rc` testy dają `10 failed`, na wersji zwykłej `10 passed`.

| # | Obszar | Błąd |
|---|---|---|
| 1 | sortowanie | sortowanie po cenie porównuje ceny jak tekst (10,99 zł przed 4,99 zł) |
| 2 | koszyk | promocja w koszyku liczona dwa razy (odżywka 9,59 zł zamiast 11,99 zł) |
| 3 | walidacja | adres w profilu przyjmuje zły kod pocztowy (`01234`) |
| 4 | adresy | nowo dodany adres sam staje się domyślny |
| 5 | faktura | na fakturze NIP sprzedawcy zamiast NIP nabywcy |
| 6 | API | `GET /api/orders/ZAM-9999` zwraca 200 `{}` zamiast 404 |
| 7 | inne | aktywny „Dodaj do koszyka” na karcie produktu niedostępnego |
| 8 | koszyk | po usunięciu ostatniej pozycji licznik pokazuje „Pozycji: 1” |
| 9 | kody | wygasły kod `JESIEN10` przyjęty (-10%) |

Do tego **6 niespodzianek Klaudiusza** (flagi): strona 404, ukryty endpoint z komentarza w HTML, data po Czarnym Piątku, ukryty produkt, kod `KLAUDIUSZ` i 5 kliknięć w logo.

**Jak szukaliśmy:** te same kroki na `rc` i na wersji zwykłej, porównanie odpowiedzi. Dwa błędy (7 i 9) znaleźliśmy dopiero wtedy, gdy uruchomiliśmy na `rc` gotowe testy z repo i sięgnęliśmy po wymagania z dokumentacji ćwiczeń.

**Ryzyka obecne w obu wersjach** (bez punktu, ale do decyzji):
- do koszyka można włożyć więcej sztuk, niż jest na stanie;
- bramka płatności przyjmuje kartę z błędną cyfrą kontrolną;
- `%` w wyszukiwarce zwraca wszystkie produkty.

**Wynik po hotfiksie Mirka:** *(do uzupełnienia po ćwiczeniu 12c)*

**Najważniejsze znalezisko z review krzyżowego:** *(do uzupełnienia po review)*

## 3. Rekomendacja (1 min)

**Nie wydajemy wersji `rc`.**

Uzasadnienie testami:
- `tests/polowanie`: na `rc` **10 failed**, na wersji zwykłej **10 passed**;
- pakiet projektu na `rc`: padają `P9 › kafelek, karta produktu i koszyk pokazują cenę 26,39 zł…` (w koszyku 21,11 zł) i `P12 › nowy adres zostaje jedynym domyślnym…`;
- błędy 2, 5 i 9 dotyczą pieniędzy: zła cena w koszyku i w zamówieniu, zły NIP na fakturze, rabat z wygasłego kodu.

Wydamy, jeśli po hotfiksie `tests/polowanie` i `tests/projekt` będą zielone na nowej wersji.

## 4. Pytanie od Bożeny (0,5 min)

Możliwe pytania i krótkie odpowiedzi:
- **„Czy to na pewno błędy, a nie zmiany?”** Każdy test ma wymaganie z `docs/projekt.md`, opisu API albo testów z repo i przechodzi na wersji zwykłej.
- **„Ile to kosztuje klienta?”** Błąd 2: klient płaci mniej (9,59 zł zamiast 11,99 zł). Błąd 9: rabat 10% z kodu, który miał nie działać. Błąd 5: faktura z NIP-em sklepu jest dla firmy bezużyteczna.
- **„Czego nie sprawdziliście?”** Funkcji administratora na serwerze, bo nie mamy hasła do konta `admin`.
