import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P7: klient nie widzi cudzych zamówień.
// Wymaganie: ZAM-1005 należy do konta admin, ZAM-1001 do konta user.
// - klient user: GET /api/orders/ZAM-1001 daje 200, GET /api/orders/ZAM-1005 daje 404 i { error: "Nie ma takiego zamówienia" };
// - administrator: GET /api/orders/ZAM-1001 daje 200;
// - bez logowania: 401 i { error: "Wymagane logowanie" }.
// Test tylko lokalnie: zamówienia ZAM-1001 i ZAM-1005 oraz konto admin są w lokalnej bazie.
// Konto user podajemy wprost, bo scenariusz dotyczy właściciela ZAM-1001.

test.describe('P7. Klient nie widzi cudzych zamówień', () => {
  test('klient user widzi swoje zamówienie ZAM-1001', async ({ request }) => {
    await zalogujPrzezApi(request, 'user', 'user123');

    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    expect(odpowiedz.status()).toBe(200);
    expect((await odpowiedz.json()).number).toBe('ZAM-1001');
  });

  test('klient user dostaje 404 dla zamówienia admina ZAM-1005', async ({ request }) => {
    await zalogujPrzezApi(request, 'user', 'user123');

    const odpowiedz = await request.get('/api/orders/ZAM-1005');

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });

  test('administrator widzi zamówienie klienta ZAM-1001', async ({ request }) => {
    await zalogujPrzezApi(request, 'admin', 'admin123');

    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    expect(odpowiedz.status()).toBe(200);
    expect((await odpowiedz.json()).number).toBe('ZAM-1001');
  });

  test('bez logowania GET /api/orders/ZAM-1001 zwraca 401 Wymagane logowanie', async ({ request }) => {
    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });
});
