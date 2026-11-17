---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Procedura pisania testu E2E

Wykonaj kroki po kolei. Nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`.

1. Przeczytaj przypadek testowy albo scenariusz od użytkownika. Wypisz wymaganie zdanie po zdaniu i oczekiwane wartości (liczby, teksty) dokładnie tak, jak podaje je wymaganie.
2. Przejdź scenariusz w działającej aplikacji (http://localhost:4100). Sprawdź, jakie role, etykiety i teksty mają elementy, których użyje test, i jakim kontem trzeba się zalogować.
3. Pokaż plan testu: nazwę pliku, nazwę testu, kroki, lokatory i asercje. Zatrzymaj się i poczekaj na akceptację użytkownika.
4. Napisz test w `tests/cwiczenia/`. Uruchom `npm run typecheck`.
5. Uruchom test dwa razy pod rząd poleceniem `npx playwright test <plik>`. Oba uruchomienia muszą dać `1 passed`.
6. Zmień na chwilę oczekiwaną wartość w asercji, uruchom test i pokaż wynik `1 failed`. Przywróć wartość i uruchom test jeszcze raz.
7. Przejdź test listą kontrolną `docs/lista-kontrolna-review.md`. Przy każdym pytaniu napisz „tak” albo „nie”. Przy „nie” podaj numer linii i popraw test.
8. Na koniec podaj ścieżkę pliku, polecenie do uruchomienia testu i wyniki uruchomień z kroków 5 i 6.
