import { test, expect } from '@playwright/test';

// Projekt P13: odliczanie do Czarnego Piątku.
// Wymaganie: GET /api/promocja z nagłówkiem X-Namssor-Teraz: 2026-11-20.
// - status 200, days_left 7, message „Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.”;
// - nagłówek X-Namssor-Teraz: jutro daje status 400.
// Endpoint jest publiczny, więc test nie loguje się.

test.describe('P13. Odliczanie do Czarnego Piątku', () => {
  test('dla daty 2026-11-20 do startu promocji zostało 7 dni', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': '2026-11-20' } });

    expect(odpowiedz.status()).toBe(200);
    expect(await odpowiedz.json()).toEqual(
      expect.objectContaining({
        days_left: 7,
        message: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.',
      }),
    );
  });

  test('nagłówek X-Namssor-Teraz z wartością jutro zwraca 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    expect(odpowiedz.status()).toBe(400);
  });
});
