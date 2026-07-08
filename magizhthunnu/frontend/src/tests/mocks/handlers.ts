import { http, HttpResponse } from 'msw';

const BASE = '/api';

export const handlers = [
  http.get(`${BASE}/auth/me`, () => HttpResponse.json({ success: false }, { status: 401 })),
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      success: true,
      data: { user: { id: '1', name: 'Test', email: 'test@example.com', role: 'customer', addresses: [] } },
    }),
  ),
  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ success: true })),
  http.get(`${BASE}/restaurants`, () =>
    HttpResponse.json({ success: true, data: { restaurants: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } } }),
  ),
];
