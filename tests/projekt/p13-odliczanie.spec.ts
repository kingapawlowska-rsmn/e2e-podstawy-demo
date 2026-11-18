import { test, expect } from '@playwright/test';

// Projekt P13: odliczanie do Czarnego Piątku.
// Wymaganie po zmianie Bożeny z 13:00 (docs/cwiczenia/12b-zmiana-wymagan.md):
// - X-Namssor-Teraz: 2026-11-26: days_left 1, message „Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.”;
// - X-Namssor-Teraz: 2026-11-27: days_left 0, message „Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.”;
// - nagłówek X-Namssor-Teraz: jutro daje status 400 (bez zmian).
// Endpoint jest publiczny, więc test nie loguje się.

// Jedna data = jeden test. Nazwa testu zawiera datę, żeby w raporcie był osobny wynik dla każdej.
const daty = [
  {
    data: '2026-11-26',
    dni: 1,
    komunikat: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.',
  },
  { data: '2026-11-27', dni: 0, komunikat: 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.' },
];

test.describe('P13. Odliczanie do Czarnego Piątku', () => {
  for (const { data, dni, komunikat } of daty) {
    test(`dla daty ${data} days_left to ${dni} i komunikat zgodny z wymaganiem`, async ({ request }) => {
      const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': data } });

      expect(odpowiedz.status()).toBe(200);
      expect(await odpowiedz.json()).toEqual(expect.objectContaining({ days_left: dni, message: komunikat }));
    });
  }

  test('nagłówek X-Namssor-Teraz z wartością jutro zwraca 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    expect(odpowiedz.status()).toBe(400);
  });
});
