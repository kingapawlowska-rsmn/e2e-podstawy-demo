import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Projekt P14: zamówienie firmowe przez API.
// Wymaganie: Biuro Mikołaja loguje się przez POST /api/login i składa POST /api/business-orders
// { product_id: 21, qty: 10, nip: "101-202-30-36", company: "Biuro Mikołaja" }.
// - status 201, status "new", qty 10, total_cents 39990, invoice.company "Biuro Mikołaja";
// - GET /api/orders/<numer>/invoice zwraca 200 i invoice_number FV/2026/<numer>;
// - qty 1001 daje 400, a w errors jest pole qty.
// Test tylko lokalnie: konto biuro i sprzątanie kontem admin.

const zamowienieBiura = { product_id: 21, nip: '101-202-30-36', company: 'Biuro Mikołaja' };

test.describe('P14. Zamówienie firmowe przez API', () => {
  let numer = '';

  test.afterEach(async ({ request }) => {
    if (!numer) return;
    await zalogujPrzezApi(request, 'admin', 'admin123');
    expect((await request.post(`/api/admin/orders/${numer}/cancel`)).status()).toBe(200);
    numer = '';
  });

  test('zamówienie 10 kalendarzy kosztuje 399,90 zł i ma fakturę FV/2026/<numer>', async ({ request }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');

    const odpowiedz = await request.post('/api/business-orders', { data: { ...zamowienieBiura, qty: 10 } });
    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    numer = zamowienie.number;
    expect(zamowienie).toEqual(expect.objectContaining({ status: 'new', qty: 10, total_cents: 39990 }));
    expect(zamowienie.invoice.company).toBe('Biuro Mikołaja');

    const faktura = await request.get(`/api/orders/${numer}/invoice`);
    expect(faktura.status()).toBe(200);
    expect((await faktura.json()).invoice_number).toBe(`FV/2026/${numer}`);
  });

  test('zamówienie firmowe na 1001 sztuk zwraca 400 z błędem pola qty', async ({ request }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');

    const odpowiedz = await request.post('/api/business-orders', { data: { ...zamowienieBiura, qty: 1001 } });

    expect(odpowiedz.status()).toBe(400);
    const { errors } = await odpowiedz.json();
    expect(errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
  });
});
