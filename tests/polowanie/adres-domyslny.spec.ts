import { test, expect } from '@playwright/test';

// Polowanie: adres domyślny po dodaniu nowego adresu do profilu.
// Wymaganie: dodanie adresu nie zmienia adresu domyślnego. Domyślny zmienia się tylko
// przez „Ustaw adres domyślny”, więc po dodaniu adresu „Praca” domyślny dalej jest „Adres główny”.
// Konto pary bierzemy z APP_USER i APP_PASSWORD (domyślnie user / user123).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test.describe('Dodanie adresu do profilu', () => {
  let token: string;

  test.beforeEach(async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login, password: haslo } });
    expect(logowanie.status()).toBe(200);
    token = (await logowanie.json()).token;

    // Start: domyślny jest adres główny (id 0), bo serwer jest wspólny.
    const ustawienie = await request.put('/api/account/addresses/0/default', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(ustawienie.status()).toBe(200);
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie: usuwamy dodatkowe adresy i przywracamy adres główny jako domyślny.
    const lista = await request.get('/api/account/addresses', { headers: { Authorization: `Bearer ${token}` } });
    for (const adres of await lista.json()) {
      if (adres.id > 0) {
        await request.delete(`/api/account/addresses/${adres.id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    }
    await request.put('/api/account/addresses/0/default', { headers: { Authorization: `Bearer ${token}` } });
  });

  test('po dodaniu adresu Praca domyślny dalej jest Adres główny', async ({ request }) => {
    const dodanie = await request.post('/api/account/addresses', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Praca', street: 'ul. Próbna 5', postal_code: '01-234', city: 'Kraków', phone: '600 700 800' },
    });
    expect(dodanie.status()).toBe(201);
    expect(await dodanie.json()).toEqual(expect.objectContaining({ name: 'Praca', default: false }));

    const lista = await request.get('/api/account/addresses', { headers: { Authorization: `Bearer ${token}` } });
    expect(lista.status()).toBe(200);
    const adresy = await lista.json();

    // Dokładnie jeden adres domyślny i jest nim adres główny.
    const domyslne = adresy.filter((adres: { default: boolean }) => adres.default);
    expect(domyslne).toEqual([expect.objectContaining({ id: 0, name: 'Adres główny' })]);
  });
});
