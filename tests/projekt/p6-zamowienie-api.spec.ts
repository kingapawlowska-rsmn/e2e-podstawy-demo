import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P6: zamówienie przez API i błędne dane.
// Wymaganie: klient loguje się przez POST /api/login i składa POST /api/orders { product_id: 10, qty: 2 }.
// - status 201, nowy numer ZAM-…, qty 2, status "new", product "Balsam do ciała";
// - GET /api/orders/<numer> zwraca 200 i to samo zamówienie;
// - qty 0 daje 400, a w errors jest pole qty;
// - produkt niedostępny (product_id 3) daje 409 i { error: "Brak towaru na stanie" }.
// Test tylko lokalnie: sprząta kontem admin (anuluje zamówienie).

test.describe('P6. Zamówienie przez API', () => {
  let numer = '';

  test.afterEach(async ({ request }) => {
    if (!numer) return;
    await zalogujPrzezApi(request, 'admin', 'admin123');
    expect((await request.post(`/api/admin/orders/${numer}/cancel`)).status()).toBe(200);
    numer = '';
  });

  test('POST /api/orders tworzy zamówienie 2 szt. Balsamu ze statusem new, a GET zwraca to samo', async ({
    request,
  }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });
    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    numer = zamowienie.number;
    expect(zamowienie.number).toMatch(/^ZAM-\d+$/);
    expect(zamowienie).toEqual(expect.objectContaining({ qty: 2, status: 'new', product: 'Balsam do ciała' }));

    const pobranie = await request.get(`/api/orders/${numer}`);
    expect(pobranie.status()).toBe(200);
    expect(await pobranie.json()).toEqual(
      expect.objectContaining({ number: numer, qty: 2, status: 'new', product: 'Balsam do ciała' }),
    );
  });

  test('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 0 } });

    expect(odpowiedz.status()).toBe(400);
    const { errors } = await odpowiedz.json();
    expect(errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
  });

  test('POST /api/orders na niedostępny produkt 3 zwraca 409 Brak towaru na stanie', async ({ request }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 3, qty: 1 } });

    expect(odpowiedz.status()).toBe(409);
    expect(await odpowiedz.json()).toEqual({ error: 'Brak towaru na stanie' });
  });
});
