---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Procedura pisania testu E2E

Wykonaj kroki po kolei. Nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`.

1. Przeczytaj przypadek testowy albo scenariusz od użytkownika. Zapisz wymaganie jednym lub dwoma zdaniami, a potem wypisz je zdanie po zdaniu z oczekiwanymi wartościami (liczby, teksty) dokładnie tak, jak podaje je wymaganie. Jeśli czegoś brakuje (konto, dane, oczekiwany tekst), zapytaj użytkownika.
2. Przejdź scenariusz w działającej aplikacji (http://localhost:4100) przez Playwright MCP, jeśli jest dostępny. Zapisz dokładne role, nazwy przycisków, etykiety pól i treść komunikatów oraz konto, którym trzeba się zalogować. Bez MCP weź je z kodu w `app/`.
3. Pokaż plan testu w punktach: nazwę pliku, nazwę testu, konto, kroki, lokatory, asercje z dokładnym tekstem i sprzątanie danych. Zatrzymaj się i poczekaj na akceptację użytkownika.
4. Napisz test w `tests/cwiczenia/` (albo w pliku wskazanym przez użytkownika). Nad testem dodaj komentarz „Wymaganie: …”. Uruchom `npm run typecheck`.
5. Do logowania użyj funkcji z `tests/pomocnicze/logowanie.ts`: `zaloguj(page)`, a w testach API `zalogujPrzezApi(request)`. Nie wpisuj loginu i hasła ręcznie w teście.
6. Uruchom test dwa razy pod rząd poleceniem `npx playwright test <plik>`. Oba uruchomienia muszą dać `1 passed`.
7. Zmień na chwilę oczekiwaną wartość w asercji, uruchom test i pokaż wynik `1 failed`. Przywróć wartość i uruchom test jeszcze raz.
8. Przejdź test listą kontrolną `docs/lista-kontrolna-review.md` punkt po punkcie. Wynik wypisz jako tabelę z kolumnami: pytanie, odpowiedź („tak” albo „nie”), linia. Przy „nie” popraw test.
9. Na koniec podaj ścieżkę pliku, polecenie, którym użytkownik uruchomi test w PowerShell, i wyniki uruchomień z kroków 6 i 7.
