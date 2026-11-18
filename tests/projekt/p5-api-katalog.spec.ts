import { test, expect } from '@playwright/test';

// Projekt P5: katalog produktów w API.
// Oba endpointy są publiczne (w app/openapi.json "security": []), więc test nie loguje się.

test.describe('P5. Katalog produktów w API', () => {
  test('GET /api/products?category=Dziecko zwraca 3 produkty z kategorii Dziecko', async ({ request }) => {
    const odpowiedz = await request.get('/api/products', { params: { category: 'Dziecko' } });

    expect(odpowiedz.status()).toBe(200);
    const produkty = await odpowiedz.json();
    // Liczba 3 pochodzi ze scenariusza P5.
    expect(produkty).toHaveLength(3);
    // Każdy produkt na liście ma kategorię „Dziecko”.
    // Nazwa produktu w komunikacie błędu pokaże, który produkt ma złą kategorię.
    for (const produkt of produkty) {
      expect(produkt.category, `kategoria produktu ${produkt.name}`).toBe('Dziecko');
    }
  });

  test('GET /api/products/999 zwraca 404 z błędem „Nie ma takiego produktu”', async ({ request }) => {
    const odpowiedz = await request.get('/api/products/999');

    expect(odpowiedz.status()).toBe(404);
    // toEqual porównuje całą treść odpowiedzi.
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
  });
});
