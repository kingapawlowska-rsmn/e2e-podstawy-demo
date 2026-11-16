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
