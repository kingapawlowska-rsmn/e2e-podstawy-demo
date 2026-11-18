import { test, expect } from '@playwright/test';

// Polowanie: NIP nabywcy na fakturze.
// Wymaganie: faktura do zamówienia na firmę ma w danych nabywcy nazwę firmy i NIP podane w zamówieniu.
// Zamówienie z NIP 241-224-12-28 i firmą „Firma Test” daje na fakturze nabywcę
// { name: 'Firma Test', nip: '2412241228' }, a nie NIP sprzedawcy.
// Konto pary bierzemy z APP_USER i APP_PASSWORD (domyślnie user / user123).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test('faktura zamówienia firmowego ma NIP nabywcy 2412241228 z zamówienia', async ({ request }) => {
  const logowanie = await request.post('/api/login', { data: { login, password: haslo } });
  expect(logowanie.status()).toBe(200);
  const { token } = await logowanie.json();

  // Własne dane: nowe zamówienie firmowe na 1 sztukę „Płynu do mycia naczyń” (id 20).
  // Klient nie anuluje zamówień, więc każde uruchomienie tworzy nowe zamówienie i nie zależy od innych.
  const zamowienie = await request.post('/api/business-orders', {
    headers: { Authorization: `Bearer ${token}` },
    data: { product_id: 20, qty: 1, nip: '241-224-12-28', company: 'Firma Test' },
  });
  expect(zamowienie.status()).toBe(201);
  const { number } = await zamowienie.json();

  const faktura = await request.get(`/api/orders/${number}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(faktura.status()).toBe(200);

  // Gdy faktura bierze NIP sprzedawcy, nabywca ma nip 1234563218 i asercja padnie.
  expect((await faktura.json()).buyer).toEqual({ name: 'Firma Test', nip: '2412241228' });
});
