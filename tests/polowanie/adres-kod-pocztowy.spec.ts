import { test, expect } from '@playwright/test';

// Polowanie: walidacja kodu pocztowego w adresach profilu.
// Wymaganie (opis API): kod pocztowy ma format 00-000. Adres z kodem „01234” jest odrzucony
// statusem 400 i komunikatem „Kod pocztowy musi mieć format 00-000”.
// Konto pary bierzemy z APP_USER i APP_PASSWORD (domyślnie user / user123).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test.describe('Adres w profilu z błędnym kodem pocztowym', () => {
  let token: string;

  test.beforeEach(async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login, password: haslo } });
    expect(logowanie.status()).toBe(200);
    token = (await logowanie.json()).token;
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie: gdy błędny adres jednak się zapisał, usuwamy wszystkie dodatkowe adresy.
    // Adres główny (id 0) zostaje.
    const lista = await request.get('/api/account/addresses', { headers: { Authorization: `Bearer ${token}` } });
    for (const adres of await lista.json()) {
      if (adres.id > 0) {
        await request.delete(`/api/account/addresses/${adres.id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    }
    await request.put('/api/account/addresses/0/default', { headers: { Authorization: `Bearer ${token}` } });
  });

  test('adres z kodem pocztowym 01234 jest odrzucony z komunikatem o formacie 00-000', async ({ request }) => {
    const odpowiedz = await request.post('/api/account/addresses', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Praca', street: 'ul. Próbna 5', postal_code: '01234', city: 'Kraków', phone: '600 700 800' },
    });

    // Gdy walidacja nie działa, API zwraca 201 i zapisuje adres, więc asercje padną.
    expect(odpowiedz.status()).toBe(400);
    expect(await odpowiedz.json()).toEqual({
      error: 'Błędne dane',
      errors: [{ field: 'postal_code', message: 'Kod pocztowy musi mieć format 00-000' }],
    });
  });
});
