Środowisko działa, npm test bez błędów.

01-wyszukiwarka.spec.ts:

1. blok beforeEach otwiera stronę główną aplikacji. Wykona się 2 razy ponieważ mamy 2 testy.
2. W stałej wyszukiwarka jest pole na stronie - label
3. exact: true oznacza, że nazwa dostępna (accessible name) komórki musi być dokładnie równa podanemu tekstowi 'Szczoteczka do zębów'.

02-moje-zamowienia.spec.ts:

1. Pod nazwą taką jaka jest zapisana w cudzysłowach.
2. Test describe opakowuje testy w "pakiet".
3. Co by się stało w drugim teście po usunięciu linii z ZAM-1001? Element nie zostałby wyfiltrowany i finalnie nie zostałby znaleziony.

03-produkt-niedostepny.spec.ts:

1. test sprawdza czy wiersz jest widoczny. produktu niedostępnego nie da się dodać do koszyka, bo test nie sprawdza czy przycisk jest niedostępny

01-wyszukiwarka.spec.ts (9)
6 page.goto('/') - czeka, aż załaduje się strona główna - przeglądarka
12 wyszukiwarka.fill('zębów') - czeka, aż pole wyszukiwania przyjmie tekst „zębów” - przeglądarka
13 Filtruj.click() - czeka, aż przycisk „Filtruj” zostanie kliknięty - przeglądarka
15 product-count toHaveText('2') - czeka, aż licznik produktów pokaże „2” - oczekiwanie
16 cell 'Pasta do zębów' toBeVisible - czeka, aż komórka „Pasta do zębów” będzie widoczna - oczekiwanie
17 cell 'Szczoteczka do zębów' toBeVisible - czeka, aż komórka „Szczoteczka do zębów” będzie widoczna - oczekiwanie
21 Szukaj produktu.fill('rower') - czeka, aż pole przyjmie tekst „rower” - przeglądarka
22 Filtruj.click() - czeka, aż przycisk „Filtruj” zostanie kliknięty - przeglądarka
24 'Brak produktów…' toBeVisible - czeka, aż pojawi się komunikat o braku wyników - oczekiwanie

02-moje-zamowienia.spec.ts (16)
7 goto('/zamowienia') - czeka, aż otworzy się strona zamówień (aplikacja pokaże logowanie) - przeglądarka
8 Login.fill('user') - czeka, aż pole Login przyjmie tekst - przeglądarka
9 Hasło.fill('user123') - czeka, aż pole Hasło przyjmie tekst - przeglądarka
10 Zaloguj.click() - czeka, aż przycisk „Zaloguj” zostanie kliknięty - przeglądarka
12 toHaveURL(/\/zamowienia$/) - czeka, aż adres strony zakończy się na /zamowienia - oczekiwanie
13 heading 'Moje zamówienia' toBeVisible - czeka, aż pojawi się nagłówek „Moje zamówienia” - oczekiwanie
16 zamowienie1001 toContainText('Szampon…') - czeka, aż wiersz zamówienia 1001 będzie zawierał „Szampon nawilżający” - oczekiwanie
19 zamowienie1002 toContainText('Pasta do zębów') - czeka, aż wiersz zamówienia 1002 będzie zawierał „Pasta do zębów” - oczekiwanie
20 zamowienie1002 toContainText('Anulowane') - czeka, aż wiersz zamówienia 1002 będzie miał status „Anulowane” - oczekiwanie
22 'Ładowanie…' toBeHidden - czeka, aż zniknie napis „Ładowanie…” - oczekiwanie
26 goto('/zamowienia') - czeka, aż otworzy się strona zamówień - przeglądarka
27 Login.fill('user') - czeka, aż pole Login przyjmie tekst - przeglądarka
28 Hasło.fill('user123') - czeka, aż pole Hasło przyjmie tekst - przeglądarka
29 Zaloguj.click() - czeka, aż przycisk „Zaloguj” zostanie kliknięty - przeglądarka
31 row 'ZAM-1001' toBeVisible - czeka, aż wiersz ZAM-1001 będzie widoczny - oczekiwanie
32 row 'ZAM-1005' toHaveCount(0) - czeka, aż na stronie nie będzie żadnego wiersza ZAM-1005 - oczekiwanie

03-produkt-niedostepny.spec.ts (4, w tym 1 dopisana przy naprawie testu)
6 goto('/') - czeka, aż załaduje się strona główna - przeglądarka
10 wiersz toBeVisible - czeka, aż wiersz „Serum z witaminą C” będzie widoczny - oczekiwanie
11 'Niedostępny' toBeVisible - czeka, aż w tym wierszu będzie widoczny napis „Niedostępny” - oczekiwanie
14 button … toBeDisabled (nowa) - czeka, aż przycisk „Dodaj do koszyka” w tym wierszu będzie zablokowany - oczekiwanie

Razem: 29 linii z await (bez dopisanej linii 28): 12 czeka na przeglądarkę, 17 na spełnienie oczekiwania (bez dopisanej linii 16).

Zasada:

- przeglądarka: await page.goto / fill / click - kod czeka, aż przeglądarka wykona akcję; Playwright sam czeka, aż element będzie gotowy
- oczekiwanie: await expect(...).toXxx() - kod sprawdza warunek co chwilę, aż się spełni; jeśli nie spełni się w limicie czasu (domyślnie 5 s), test kończy się błędem

Dwie linie warte omówienia:

- 02:22 toBeHidden() - oczekiwanie może dotyczyć tego, że coś zniknie; test czeka, aż skończy się ładowanie
- 02:32 toHaveCount(0) - asercja sprawdza, że czegoś na stronie nie ma; przechodzi, gdy wiersza ZAM-1005 nie ma

---

Testy Klaudiusza (04, 05, 06)

| Test | Co sprawdza | Czego nie sprawdza |
|---|---|---|
| 04-ceny-promocyjne (jeden wiersz na cały plik) | Dla 3 produktów (Odżywka, Krem, Serum) kafelek pokazuje starą cenę i nową cenę, wpisane na sztywno w tablicy, oraz że plakietka jest widoczna. | Że rabat wynosi 20%: nic tego nie liczy, nowa cena jest przepisana z tablicy. Nie sprawdza tekstu plakietki („-20%”), tylko to, że jest widoczna. Nie sprawdza ceny w tabeli ani na karcie produktu. |
| 05 › karta produktu pokazuje opis i dostępność | Po kliknięciu kafelka „Szampon nawilżający” otwiera się karta z nagłówkiem h1 o tej nazwie (w funkcji), opis zawiera „400 ml”, dostępność zawiera „Dostępny”. | Całego opisu, tylko fragment „400 ml”. Że przycisk „Dodaj do koszyka” jest aktywny. |
| 05 › cena na karcie produktu jest taka sama jak na kafelku | Karta „Krem do twarzy na dzień” się otwiera (w funkcji) i pokazuje cenę „26,39 zł”. | Tego, co obiecuje nazwa: nie odczytuje ceny z kafelka, porównuje z liczbą wpisaną na sztywno. Nie sprawdza starej ceny ani plakietki na karcie. |
| 05 › produktu niedostępnego nie da się dodać do koszyka z karty produktu | Karta „Maska do włosów z olejem arganowym” się otwiera (w funkcji), dostępność to „Niedostępny”, przycisk „Dodaj do koszyka” jest zablokowany. | Że pole Ilość też jest zablokowane. Że koszyk się nie zmienia (próba dodania przez formularz lub API). |
| 06-filtr-kategorii (jeden wiersz na cały plik) | Dla kategorii Włosy, Dziecko i Dom: po wybraniu kategorii i kliknięciu „Filtruj” licznik pokazuje 4 / 3 / 1, a w tabeli jest wiersz z przykładowym produktem tej kategorii. | Że na liście są tylko produkty z tej kategorii (brak produktów z innych kategorii). Test „lista zawiera produkt…” przeszedłby nawet wtedy, gdyby filtr w ogóle nie działał, bo produkt jest też na pełnej liście. Nie sprawdza, że lista ma tyle wierszy, ile pokazuje licznik. |

Odpowiedzi

04:
- Z pliku powstaną 3 testy, po jednym na każdy produkt z tablicy (pętla for w test.describe).
- Nazwy:
  Ceny promocyjne na kafelkach › Odżywka do włosów ma cenę obniżoną o 20%
  Ceny promocyjne na kafelkach › Krem do twarzy na dzień ma cenę obniżoną o 20%
  Ceny promocyjne na kafelkach › Serum z witaminą C ma cenę obniżoną o 20%
- Która linia sprawdza „obniżoną o 20%”? Żadna. Linia 21 sprawdza starą cenę, linia 22 nową cenę, obie przepisane z tablicy. Linia 23 sprawdza tylko, że plakietka jest widoczna, a nie jej tekst „-20%”. Ceny w tablicy akurat zgadzają się z rabatem 20% (np. 14,99 x 0,8 = 11,99), ale wyliczył je autor, nie test. Gdyby aplikacja dała rabat 25%, a ktoś poprawił tablicę, test dalej by przechodził.

05:
- Funkcja otworzKarteProduktu, zanim test dojdzie do swoich linii z expect: otwiera stronę główną (goto '/'), w kafelku produktu klika link z nazwą produktu i sprawdza, że widać nagłówek h1 z tą nazwą. Czyli zawiera już jedną asercję.
- Drugi test ma razem 2 asercje: 1 w funkcji (nagłówek h1 widoczny) + 1 w teście (cena 26,39 zł).
- CLAUDE.md w repo: „Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.” Funkcja otworzKarteProduktu łamie tę zasadę. Plik łamie też zasadę „Importuj wyłącznie import { test, expect } from '@playwright/test';”, bo importuje dodatkowo type Page (potrzebny właśnie przez funkcję pomocniczą).

06:
- Powstanie 6 testów: 3 kategorie x 2 testy w każdej grupie.
- Pełna nazwa przykładowego testu w raporcie:
  [chromium] › tests\czytanie\06-filtr-kategorii.spec.ts › Filtr kategorii › kategoria Dom › licznik pokazuje liczbę produktów w kategorii
- Kolejność beforeEach przed testem „licznik…” dla kategorii Dom: najpierw zewnętrzny (z grupy „Filtr kategorii”), potem wewnętrzny (z grupy „kategoria Dom”):
  1. page.goto('/') - otwiera stronę główną
  2. selectOption('Dom') i click „Filtruj” - wybiera kategorię i filtruje
  3. dopiero potem sam test: licznik ma pokazać „1”
  Oba beforeEach wykonują się przed każdym z 6 testów osobno.

Komentarz do review (najpoważniejsza luka)

Plik: tests/czytanie/06-filtr-kategorii.spec.ts, test „lista zawiera produkt z tej kategorii” (linie 28-30).

Ten test nie sprawdza, czy filtr działa. Sprawdza tylko, że na liście jest jeden przykładowy produkt z kategorii, a ten produkt jest też na pełnej liście bez filtra. Gdyby filtr kategorii w ogóle nie działał (np. aplikacja ignorowała wybór i pokazywała wszystko), test dalej byłby zielony we wszystkich 3 kategoriach. Ma zieloną nazwę, ale nie ma żadnej mocy wykrywania błędu.

Czego brakuje: sprawdzenia, że na liście NIE ma produktów z innych kategorii.

Propozycja asercji (dopisać w tym teście, nazwę zmienić na „lista zawiera tylko produkty z tej kategorii”):

```ts
// Wiersze z produktami (wiersz nagłówka nie ma komórek typu cell).
const wierszeZProduktami = page.getByRole('row').filter({ has: page.getByRole('cell') });

// Wiersze, w których żadna komórka nie jest dokładnie nazwą wybranej kategorii.
const wierszeZInnejKategorii = wierszeZProduktami.filter({
  hasNot: page.getByRole('cell', { name: kategoria.nazwa, exact: true }),
});

// Po filtrowaniu nie może zostać ani jeden produkt z innej kategorii.
await expect(wierszeZInnejKategorii).toHaveCount(0);
```

Istniejącą asercję z przykładowym produktem warto zostawić: toHaveCount(0) przeszłoby też na pustej liście, a ona pilnuje, że lista nie jest pusta.
Dlaczego to, a nie 04 (brak sprawdzenia 20%): w 04 ceny w tablicy są poprawne, więc test łapie zmianę ceny. Test w 06 nie łapie niczego.
