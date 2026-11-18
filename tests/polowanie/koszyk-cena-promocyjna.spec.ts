import { test, expect } from '@playwright/test';

// Polowanie: cena promocyjna w koszyku.
// Wymaganie: „Odżywka do włosów” kosztuje regularnie 14,99 zł i ma promocję -20%,
// więc w koszyku cena za sztukę to 11,99 zł (1199 groszy), tak samo jak w katalogu.
// Konto pary bierzemy z APP_USER i APP_PASSWORD (domyślnie user / user123).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test.describe('Koszyk z produktem w promocji', () => {
  let token: string;

  test.beforeEach(async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login, password: haslo } });
    expect(logowanie.status()).toBe(200);
    token = (await logowanie.json()).token;

    // Zaczynamy od pustego koszyka, bo serwer jest wspólny.
    const czyszczenie = await request.delete('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
    expect(czyszczenie.status()).toBe(200);
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie: pusty koszyk także wtedy, gdy test padł.
    const czyszczenie = await request.delete('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
    expect(czyszczenie.status()).toBe(200);
  });

  test('Odżywka do włosów w koszyku kosztuje 11,99 zł za sztukę', async ({ request }) => {
    // Odżywka do włosów ma id 2.
    const dodanie = await request.post('/api/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 2, qty: 1 },
    });
    expect(dodanie.status()).toBe(201);

    const koszyk = await request.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
    expect(koszyk.status()).toBe(200);
    const { items, total_cents } = await koszyk.json();

    // Gdy promocja zostanie naliczona dwa razy, cena spadnie poniżej 11,99 zł i asercja padnie.
    expect(items).toEqual([
      expect.objectContaining({ product_id: 2, name: 'Odżywka do włosów', qty: 1, unit_price_cents: 1199 }),
    ]);
    expect(total_cents).toBe(1199);
  });
});
