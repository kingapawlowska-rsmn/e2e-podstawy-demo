import { test, expect } from '@playwright/test';

// Polowanie: zapytanie API o zamówienie, którego nie ma.
// Wymaganie (opis API): GET /api/orders/{number} dla nieistniejącego numeru zwraca 404
// i treść { error: 'Nie ma takiego zamówienia' }.
// Konto pary bierzemy z APP_USER i APP_PASSWORD (domyślnie user / user123).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test('GET /api/orders/ZAM-9999 zwraca 404 z komunikatem Nie ma takiego zamówienia', async ({ request }) => {
  const logowanie = await request.post('/api/login', { data: { login, password: haslo } });
  expect(logowanie.status()).toBe(200);
  const { token } = await logowanie.json();

  // Test tylko czyta dane, więc nie ma czego sprzątać.
  const odpowiedz = await request.get('/api/orders/ZAM-9999', {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Gdy API zwraca 200 z pustym obiektem, obie asercje padną.
  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});
