// Teksty z ekranu, które powtarzają się w wielu testach.
// Gdy aplikacja zmieni napis (np. hotfix Mirka, ćwiczenie 12c), poprawiasz go tylko tutaj,
// a nie w każdym pliku testu osobno.
//
// Użycie w teście:
//   import { TEKSTY } from '../pomocnicze/teksty';
//   await expect(page.getByText(TEKSTY.dodanoDoKoszyka('Krem do twarzy na dzień'))).toBeVisible();

export const TEKSTY = {
  // Komunikat po kliknięciu „Dodaj do koszyka”.
  dodanoDoKoszyka: (produkt: string) => `Dodano do koszyka: ${produkt}`,
  // Przycisk zapisu w formularzach adresu („Adres dostawy” i „Moje adresy”).
  zapiszAdres: 'Zapisz adres',
  // Przycisk przy polu „Kod rabatowy” w koszyku.
  zastosujKod: 'Zastosuj kod',
  // Link do pliku faktury na stronie zamówienia.
  pobierzFakture: 'Pobierz fakturę',
  // Status zamówienia po opłaceniu (lista „Status zamówienia” w panelu admina i strona zamówienia).
  statusOplacone: 'Opłacone',
  // Dostępność na karcie produktu (tabela na stronie głównej ma własne napisy).
  kartaDostepny: 'Dostępny',
  kartaNiedostepny: 'Niedostępny',
};
