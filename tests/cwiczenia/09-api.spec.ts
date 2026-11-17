import { test, expect } from '@playwright/test';

// Ćwiczenie 09: testy API zamówień i dane przygotowane przez API.
// Opis endpointów: http://localhost:4100/api/docs (plik app/openapi.json).
//
// Logowanie przez API zwraca token. Token wysyłasz w nagłówku Authorization:
//   const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
//   const { token } = await logowanie.json();
//   await request.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/09-api.spec.ts

test.describe('API zamówień', () => {
  test('GET /api/orders zwraca zamówienia zalogowanego klienta', async ({ request }) => {
    // Ten test jest gotowy: wzór dla pozostałych.
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(200);
    const zamowienia = await odpowiedz.json();
    expect(zamowienia).toContainEqual(
      expect.objectContaining({ number: 'ZAM-1001', product: 'Szampon nawilżający', customer: 'user' }),
    );
  });

  test('POST /api/orders tworzy zamówienie ze statusem „new”', async ({ request }) => {
    // TODO 1: zaloguj się jako user i weź token
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    // TODO 2: POST /api/orders z danymi { product_id: 20, qty: 2 }
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 2 },
    });

    // TODO 3: sprawdź status 201 i treść: product „Płyn do mycia naczyń”, qty 2, status „new”,
    //   numer w formacie ZAM-1234
    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    expect(zamowienie).toEqual(
      expect.objectContaining({ product: 'Płyn do mycia naczyń', qty: 2, status: 'new', customer: 'user' }),
    );
    expect(zamowienie.number).toMatch(/^ZAM-\d{4}$/);

    // TODO 4: posprzątaj: zaloguj się jako admin i wyślij
    //   POST /api/admin/orders/<numer>/cancel (oczekiwany status 200)
    const logowanieAdmina = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token: tokenAdmina } = await logowanieAdmina.json();
    const anulowanie = await request.post(`/api/admin/orders/${zamowienie.number}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    expect(anulowanie.status()).toBe(200);
  });

  test('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    // TODO: zaloguj się jako user, wyślij { product_id: 20, qty: 0 }.
    // Sprawdź status 400 i całą treść odpowiedzi: pole „error” i listę „errors” z polami field i message.
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 0 },
    });

    expect(odpowiedz.status()).toBe(400);
    // toEqual porównuje całą treść: żadne inne pole ani błąd nie może się pojawić
    expect(await odpowiedz.json()).toEqual({
      error: 'Błędne dane',
      errors: [{ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' }],
    });
  });

  test('GET /api/orders bez logowania zwraca 401', async ({ request }) => {
    // TODO: wyślij żądanie bez tokena, sprawdź status 401 i treść { error: '...' }
    const odpowiedz = await request.get('/api/orders');

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });

  test('GET /api/orders/ZAM-9999 zwraca 404', async ({ request }) => {
    // TODO: zaloguj się jako user, zapytaj o nieistniejące zamówienie, sprawdź status 404 i treść
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders/ZAM-9999', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });
});

test.describe('Anulowanie zamówienia przygotowanego przez API', () => {
  // Numer zamówienia utworzonego przed testem
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // TODO 1: zaloguj się przez API jako user, utwórz zamówienie { product_id: 20, qty: 1 },
    //   sprawdź status 201 i zapisz numer: numer = (await odpowiedz.json()).number;
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 1 },
    });
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // TODO 2: sprzątanie. Zaloguj się przez API jako admin i anuluj zamówienie `numer`.
    //   Gdy test już je anulował, API odpowie 409. Oba statusy (200 i 409) są tu w porządku.
    // afterEach działa także wtedy, gdy test się wywali, więc zamówienie zawsze zostanie anulowane.
    const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 409]).toContain(odpowiedz.status());
  });

  test('admin anuluje nowe zamówienie w panelu', async ({ page }) => {
    // TODO 3: zaloguj się w przeglądarce jako admin, otwórz /admin/zamowienia
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
    await page.goto('/admin/zamowienia');

    // TODO 4: znajdź wiersz po numerze `numer`, sprawdź status „Nowe”, kliknij „Anuluj”
    const wiersz = page.getByRole('row').filter({ hasText: numer });
    await expect(wiersz).toContainText('Nowe');
    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    // TODO 5: sprawdź komunikat „Anulowano zamówienie <numer>” i status „Anulowane” w wierszu
    await expect(page.getByText(`Anulowano zamówienie ${numer}`)).toBeVisible();
    await expect(wiersz).toContainText('Anulowane');
  });
});

// Dla szybszych: zamówienie firmowe Biura Mikołaja i faktura przez API.
test.describe('Faktura do zamówienia firmowego', () => {
  // Numer zamówienia firmowego utworzonego przed testem
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // Dane przez API: zamówienie firmowe jako biuro.
    const logowanie = await request.post('/api/login', { data: { login: 'biuro', password: 'biuro123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.post('/api/business-orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 21, qty: 10, nip: '2412241228', company: 'Biuro Mikołaja' },
    });
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie: anuluj zamówienie. 409 oznacza, że test już je anulował.
    const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 409]).toContain(odpowiedz.status());
  });

  test('faktura zawiera NIP nabywcy, ilość i wartość zamówienia', async ({ request }) => {
    // Oczekiwana wartość: cena promocyjna produktu 21 razy 10 sztuk
    const produkt = await request.get('/api/catalog/21');
    expect(produkt.status()).toBe(200);
    const { promo_price_cents } = await produkt.json();

    const logowanie = await request.post('/api/login', { data: { login: 'biuro', password: 'biuro123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.get(`/api/orders/${numer}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(200);
    const faktura = await odpowiedz.json();
    expect(faktura.buyer).toEqual({ name: 'Biuro Mikołaja', nip: '2412241228' });
    expect(faktura.items[0].qty).toBe(10);
    expect(faktura.total_cents).toBe(promo_price_cents * 10);
  });

  test('po anulowaniu zamówienia faktura zwraca 404', async ({ request }) => {
    // Anuluj zamówienie jako admin
    const logowanieAdmina = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token: tokenAdmina } = await logowanieAdmina.json();
    const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    expect(anulowanie.status()).toBe(200);

    // Faktura anulowanego zamówienia już nie istnieje
    const logowanie = await request.post('/api/login', { data: { login: 'biuro', password: 'biuro123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.get(`/api/orders/${numer}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'To zamówienie nie ma faktury' });
  });
});
