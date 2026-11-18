# ZNALEZIONE BŁĘDY: krok po kroku

Wszystko, co trzeba kliknąć i wpisać, żeby na żywo pokazać błędy z polowania. Szczegóły błędów są w `WYNIKI.md`, a plan prezentacji w `PREZENTACJA.md`.

## 0. Dane, które będą potrzebne

| Co                         | Wartość                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Wersja `rc` (z błędami)    | `https://namssor-rc-376292984721.europe-central2.run.app` (krótko: `namssor-rc.prosit.cloud`) |
| Wersja zwykła (bez błędów) | `https://namssor-376292984721.europe-central2.run.app` (krótko: `namssor.prosit.cloud`)       |
| Login                      | `tester04`                                                                                    |
| Hasło                      | `czarny-piatek-2026`                                                                          |
| Konto drugiej osoby z pary | `tester01`, to samo hasło                                                                     |

Którą wersję masz otwartą, sprawdzisz w stopce strony: na `rc` jest napis „Wersja: rc”.

## 1. Przygotowanie przed prezentacją (5 minut wcześniej)

1. Otwórz **dwie karty przeglądarki** obok siebie:
   - w pierwszej wpisz `namssor-rc.prosit.cloud`;
   - w drugiej wpisz `namssor.prosit.cloud`.
2. **Zaloguj się w obu kartach**, w każdej osobno:
   1. Kliknij „Zaloguj” w prawym górnym rogu.
   2. W polu „Login” wpisz `tester04`.
   3. W polu „Hasło” wpisz `czarny-piatek-2026`.
   4. Kliknij przycisk „Zaloguj”.
   5. Na górze strony powinno być „Zalogowano jako tester04”.
3. Otwórz **PowerShell** (okno polowania) i przejdź do katalogu repo:
   ```powershell
   cd "C:\PlaywrightProjects\20261116-18 - Szkolenie Playwright Claude\e2e-podstawy-demo"
   ```
4. W tym samym oknie ustaw konto pary. Bez tego testy nie zalogują się na serwerze:
   ```powershell
   $env:APP_USER="tester04"
   $env:APP_PASSWORD="czarny-piatek-2026"
   ```
5. Sprawdź, czy koszyk jest pusty (na obu kartach: „Koszyk” → „Koszyk jest pusty.”). Jeśli nie jest, usuń produkty przyciskami „Usuń”.

## 2. Dowód testami (najkrótsza wersja, około 30 sekund)

W oknie PowerShell z kroku 1 wpisz:

```powershell
$env:BASE_URL="https://namssor-rc-376292984721.europe-central2.run.app"
npx playwright test tests/polowanie --workers=1
```

Oczekiwany wynik: **10 failed**. To 9 błędów, bo test karty produktu sprawdza 2 produkty.

```powershell
$env:BASE_URL="https://namssor-376292984721.europe-central2.run.app"
npx playwright test tests/polowanie --workers=1
```

Oczekiwany wynik: **10 passed**.

Jeden test na raz, np. sortowanie:

```powershell
npx playwright test tests/polowanie/sortowanie-po-cenie.spec.ts
```

Raport HTML z ostatniego uruchomienia (zrzuty ekranu przy błędach):

```powershell
npx playwright show-report
```

## 3. Każdy błąd pokazany ręcznie

Każdy krok rób **najpierw w karcie `rc`, potem w karcie z wersją zwykłą**, żeby było widać różnicę. Po każdym pokazie posprzątaj, jak opisano przy danym błędzie.

### Błąd 1. Sortowanie po cenie (obszar: sortowanie)

1. Kliknij „Produkty” w menu.
2. W polu „Sortuj” wybierz „Cena: od najniższej”.
3. Kliknij „Filtruj”.
4. **`rc`:** pierwszy jest „Szampon dla dzieci” za 10,99 zł. **Zwykła:** pierwsze jest „Mydło w kostce” za 4,99 zł.
5. Sprzątanie: niepotrzebne.

### Błąd 2. Podwójna promocja w koszyku (obszar: koszyk)

1. „Produkty” → w wierszu „Odżywka do włosów” kliknij „Dodaj do koszyka”.
2. Kliknij „Koszyk” w menu.
3. **`rc`:** cena 9,59 zł. **Zwykła:** 11,99 zł (14,99 zł − 20%).
4. Sprzątanie: kliknij „Usuń” przy odżywce.

### Błąd 3. Zły kod pocztowy w adresie (obszar: walidacja)

1. Kliknij „Moje adresy” w menu.
2. W sekcji „Dodaj adres” wpisz:
   - Nazwa adresu: `Pokaz`
   - Ulica i numer: `ul. Próbna 5`
   - Kod pocztowy: `01234` (bez myślnika)
   - Miasto: `Kraków`
   - Telefon: `600 700 800`
3. Kliknij „Dodaj adres”.
4. **`rc`:** adres się zapisuje. **Zwykła:** „Kod pocztowy musi mieć format 00-000”.
5. Sprzątanie na `rc`: kliknij „Usuń” przy adresie „Pokaz”. Jeśli „Domyślny” nie wróciło do „Adres główny”, kliknij „Ustaw jako domyślny” przy „Adres główny”.

### Błąd 4. Nowy adres staje się domyślny (obszar: adresy)

1. „Moje adresy” → dodaj adres jak w błędzie 3, ale z poprawnym kodem `01-234`.
2. **`rc`:** plakietka „Domyślny” jest przy nowym adresie „Pokaz”. **Zwykła:** „Domyślny” zostaje przy „Adres główny”.
3. Sprzątanie w obu kartach: „Usuń” przy „Pokaz”. Na koniec „Domyślny” ma być przy „Adres główny”.

### Błąd 5. NIP sprzedawcy na fakturze (obszar: faktura)

1. Kliknij „Moje zamówienia” i poczekaj, aż zniknie „Ładowanie…”.
2. Kliknij numer zamówienia, które ma fakturę, np. jedno z najstarszych („Odżywka do włosów”, 2 szt.). Na jego stronie jest linia „Faktura na firmę: Firma Test, NIP 2412241228”.
3. Kliknij „Pobierz fakturę” i otwórz pobrany plik.
4. **`rc`:** „NIP nabywcy: 1234563218”, czyli NIP sprzedawcy. **Zwykła:** „NIP nabywcy: 2412241228”.
5. Sprzątanie: niepotrzebne.

### Błąd 6. API zwraca 200 dla zamówienia, którego nie ma (obszar: API)

1. W pasku adresu dopisz do adresu serwera `/api/orders/ZAM-9999`, np. `namssor-rc.prosit.cloud/api/orders/ZAM-9999`.
2. **`rc`:** pusta odpowiedź `{}`. **Zwykła:** `{"error":"Nie ma takiego zamówienia"}`.
3. Sprzątanie: niepotrzebne.

### Błąd 7. Aktywny przycisk przy produkcie niedostępnym (obszar: inne)

1. „Produkty” → przewiń do kafelków „Oferta na Czarny Piątek” → kliknij nazwę „Maska do włosów z olejem arganowym”.
2. Karta pokazuje „Niedostępny”.
3. **`rc`:** przycisk „Dodaj do koszyka” jest aktywny. **Zwykła:** przycisk jest szary (wyłączony).
4. Sprzątanie: niepotrzebne (kliknięcie na `rc` i tak nic nie dodaje).

### Błąd 8. Licznik po usunięciu ostatniej pozycji (obszar: koszyk)

1. Upewnij się, że koszyk jest pusty.
2. „Produkty” → przy „Mydło w kostce” kliknij „Dodaj do koszyka”.
3. „Koszyk” → kliknij „Usuń” przy mydle.
4. **`rc`:** „Koszyk jest pusty.”, ale wyżej „Pozycji: 1, razem: 0,00 zł”. **Zwykła:** „Pozycji: 0, razem: 0,00 zł”.
5. Sprzątanie: niepotrzebne, koszyk jest pusty.

### Błąd 9. Wygasły kod JESIEN10 (obszar: kody)

1. „Produkty” → przy „Szampon nawilżający” kliknij „Dodaj do koszyka”.
2. „Koszyk” → w polu „Kod rabatowy” wpisz `JESIEN10` → „Zastosuj kod”.
3. **`rc`:** „Kod JESIEN10 przyjęty: -10% na całe zamówienie.”. **Zwykła:** „Kod JESIEN10 wygasł 31.10.2026.”.
4. Sprzątanie: na `rc` kliknij „Usuń kod”, potem w obu kartach „Usuń” przy szamponie.

## 4. Niespodzianki (jeśli zostanie czas)

| Flaga         | Jak pokazać                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `FLAGA-B38N2` | wpisz dowolny nieistniejący adres, np. `namssor-rc.prosit.cloud/abc`                                                                           |
| `FLAGA-9R6VC` | otwórz `namssor-rc.prosit.cloud/api/bozena/wymagania`; adres pochodzi z komentarza w źródle strony (Ctrl+U)                                    |
| `FLAGA-ZN6MD` | tylko przez API z nagłówkiem `X-Namssor-Teraz: 2026-11-28`; na prezentacji wystarczy to powiedzieć                                             |
| `FLAGA-RV9AY` | otwórz `namssor-rc.prosit.cloud/produkt/22`                                                                                                    |
| `FLAGA-XLTK7` | w koszyku z dowolnym produktem wpisz kod `KLAUDIUSZ`. Flaga jest w odpowiedzi API (DevTools, F12 → Network). Potem „Usuń kod” i „Usuń” produkt |
| `FLAGA-WUR7S` | kliknij 5 razy w logo „namssor” w ciągu 10 sekund                                                                                              |

## 5. Pakiet projektu (P1–P16) lokalnie

Testy z kontem `admin` i `biuro` działają tylko na aplikacji na waszym komputerze. Dlatego **w nowym oknie PowerShell** (oknie testów, bez `BASE_URL`):

```powershell
cd "C:\PlaywrightProjects\20261116-18 - Szkolenie Playwright Claude\e2e-podstawy-demo"
npx playwright test tests/projekt --workers=1
```

Oczekiwany wynik: **29 passed**. Playwright sam uruchomi aplikację.

Zmiana wymagań z 13:00 (ćwiczenie 12b) jest już w pakiecie. Żeby ją pokazać:

```powershell
npx playwright test tests/projekt/p13 tests/projekt/p16
```
Oczekiwany wynik: **4 passed**. P13 ma osobne wyniki dla 26.11 i 27.11, a P16 sprawdza 24 kalendarze za 959,76 zł.

Jak zmiana wygląda w historii gita:

```powershell
git --no-pager log --stat -1 --grep="zmiana wymagań"
```
Wynik: commit „Projekt P13 i P16: zmiana wymagań Bożeny z 13:00”, w którym zmieniły się 2 istniejące pliki (`p13-odliczanie.spec.ts`, `p16-ilosc-z-karty.spec.ts`), bez `create mode`. Gdyby git pokazał `(END)`, wciśnij `q`.

Gdyby w tym oknie był ustawiony serwer, najpierw go usuń:

```powershell
Remove-Item Env:BASE_URL
```

## 6. Po prezentacji

- Na `rc` kontem `tester04`: koszyk pusty, w „Moje adresy” tylko „Adres główny” (wymóg z ćwiczenia 13).
- Jeśli coś zostało: „Koszyk” → „Usuń” przy każdym produkcie; „Moje adresy” → „Usuń” przy dodatkowych adresach.
