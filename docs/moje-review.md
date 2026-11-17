# Moje review

## Ćwiczenie 08: poprawki do planu

Poprawki do planu i testu `tests/cwiczenia/08-zmiana-adresu.spec.ts` po porównaniu z `docs/scenariusze/zmiana-adresu.md` i `.feature`:

1. Linia `test.describe.configure({ mode: 'serial' });` ma być zapisana dokładnie jak w zadaniu, w pojedynczym cudzysłowie. Claude zapisał `"serial"` i linii nie dało się znaleźć po tekście z zadania.
2. Brak sprawdzenia warunku wstępnego: po otwarciu „Adres dostawy” pola mają zawierać adres startowy (TC-ADR-01 krok 2, TC-ADR-02 krok 1). Dopisane w `beforeEach` dla wszystkich 4 pól.
3. Brak sprawdzenia, że pola pokazują wpisane wartości przed kliknięciem „Zapisz adres” (TC-ADR-01 krok 3). Dopisane.
4. W testach z tabeli Przykłady sprawdzane było tylko zmienione pole. Wymaganie „adres zapisany na koncie się nie zmieni” dotyczy całego adresu: po ponownym otwarciu strony sprawdzane są teraz wszystkie 4 pola.

## Ćwiczenie 08, część B: porównanie formatów TC-FV-01

Kroki z `docs/scenariusze/biuro-mikolaja.md` (Azure Test Plans) zestawione z liniami `docs/scenariusze/biuro-mikolaja.feature` (Gherkin).

| Krok w Azure Test Plans | Linia w Gherkinie | Różnica |
|---|---|---|
| 1. Zaloguj się jako `biuro` → „Zalogowano jako biuro (user)” | 8: `Zakładając, że jestem zalogowany jako "biuro" z hasłem "biuro123"`, 9: `Oraz mój koszyk jest pusty` | Gherkin nie podaje oczekiwanego napisu w nagłówku. Pusty koszyk w obu jest warunkiem wstępnym |
| 2. Karta produktu, Ilość 10, „Dodaj do koszyka” → „Dodano do koszyka: Kalendarz adwentowy 2026” | 12: `Jeżeli dodam do koszyka 10 sztuk produktu "Kalendarz adwentowy 2026" z karty produktu` | Gherkin nie podaje komunikatu po dodaniu do koszyka ani adresu `/produkt/21` |
| 3. Koszyk → jedna pozycja, ilość 10, „Pozycji: 1, razem: 399,90 zł” | brak | Gherkin w ogóle nie sprawdza koszyka |
| 4. „Faktura na firmę”, NIP, nazwa firmy, „Złóż zamówienie…” → „Złożono zamówienie: ZAM-…” | 13–17 | brak |
| 5. Numer zamówienia na liście „Moje zamówienia” → „Nowe”, „Faktura na firmę: Biuro Mikołaja, NIP 2412241228”, przycisk „Pobierz fakturę” | 18: `Oraz na stronie zamówienia zobaczę status "Nowe" i NIP "2412241228"` | Gherkin nie sprawdza nazwy firmy ani przycisku „Pobierz fakturę” i nie mówi, jak dojść do strony zamówienia |
| 6. Wyloguj, zaloguj jako `admin`, `/admin/zamowienia/<numer>` → „Nowe”, pole „Status zamówienia” | 19: `Jeżeli admin zmieni status zamówienia na "Opłacone", a potem na "Wysłane"` | Gherkin pomija wylogowanie, hasło admina, adres strony i to, co admin widzi przed zmianą |
| 7. Status „Opłacone”, „Zapisz status” → „Opłacone” | 19 (ta sama linia) | Gherkin nie sprawdza statusu pośredniego „Opłacone” |
| 8. Status „Wysłane”, „Zapisz status” → „Wysłane” | 19 (ta sama linia) | Gherkin nie sprawdza statusu w panelu admina, tylko później u klienta |
| 9. Wyloguj, zaloguj jako `biuro`, otwórz zamówienie → „Wysłane” | 20: `Wtedy na stronie zamówienia zobaczę status "Wysłane"` | Gherkin pomija powrót na konto klienta |
| 10. „Pobierz fakturę” → plik `faktura-<numer>.html`, NIP nabywcy, nabywca „Biuro Mikołaja”, pozycja, „Razem do zapłaty: 399,90 zł” | 21–27 | Gherkin nie sprawdza nabywcy „Biuro Mikołaja” na fakturze |

**Czego brakuje w Gherkinie:** sprawdzenia koszyka (krok 3), komunikatu po dodaniu do koszyka, nazwy firmy i przycisku na stronie zamówienia, statusu „Opłacone”, przełączania kont (admin i klient), nabywcy na fakturze oraz sekcji „Po teście” (zamówienie zostaje w bazie jako „Wysłane”, stan przywraca `npm run db:reset`).

**Czego brakuje w krokach Azure Test Plans:**
- Gherkin podaje pozycję faktury jako tabelę z nazwami kolumn (Nazwa, Ilość, Cena, Wartość), więc wiadomo, która liczba jest w której kolumnie. Kroki Azure Test Plans podają same wartości.
- Gherkin opisuje cel w nagłówku `Funkcja` („Admin zmienia status zamówienia, a klient pobiera fakturę z NIP-em nabywcy”). W Azure Test Plans jest tylko krótki tytuł.
