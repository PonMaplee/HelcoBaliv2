// dashboardApi.js — klien tipis untuk API dashboard B2B.
// Tidak ada state management; cukup fetch + token bearer di localStorage.

export const SESSION_KEY = 'helcobali-auth-session-v1';
export const DASH_LANG_KEY = 'helcobali-dashboard-lang-v1';

const BASE = '/api/dashboard';

export function getSession() {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

async function request(method, path, body) {
  const session = getSession();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Permintaan gagal.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  request,
  // auth
  login: (email, password) => request('POST', '/login', { email, password }),
  register: (payload) => request('POST', '/register', payload),
  me: () => request('GET', '/me'),
  // reads
  products: () => request('GET', '/products'),
  stores: () => request('GET', '/stores'),
  rows: () => request('GET', '/rows'),
  requests: () => request('GET', '/requests'),
  production: () => request('GET', '/production'),
  shifts: () => request('GET', '/shifts'),
  activities: () => request('GET', '/activities'),
  settings: () => request('GET', '/settings'),
  // mutations
  createProduct: (body) => request('POST', '/products', body),
  updateProduct: (id, body) => request('PUT', `/products/${id}`, body),
  deleteProduct: (id) => request('DELETE', `/products/${id}`),
  seedCatalog: () => request('POST', '/products/seed'),
  approveStore: (id) => request('PATCH', `/stores/${id}/approve`),
  rejectStore: (id) => request('PATCH', `/stores/${id}/reject`),
  createRow: (body) => request('POST', '/rows', body),
  createRequest: (body) => request('POST', '/requests', body),
  approveRequest: (id, body) => request('POST', `/requests/${id}/approve`, body),
  rejectRequest: (id) => request('POST', `/requests/${id}/reject`),
  shipRequest: (id) => request('POST', `/requests/${id}/ship`),
  receiveRequest: (id, body) => request('POST', `/requests/${id}/receive`, body),
  createProduction: (body) => request('POST', '/production', body),
  markReady: (id) => request('PATCH', `/production/${id}/ready`),
  createShift: (body) => request('POST', '/shifts', body),
  reviseShift: (id, body) => request('POST', `/shifts/${id}/revise`),
  updateSettings: (body) => request('PUT', '/settings', body),
};

// Muat semua entity + user saat ini, lalu rakit jadi satu blob `data`.
export async function loadDashboard() {
  const [products, stores, rows, requests, production, shifts, activities, settings, me] =
    await Promise.all([
      api.products(),
      api.stores(),
      api.rows(),
      api.requests(),
      api.production(),
      api.shifts(),
      api.activities(),
      api.settings(),
      api.me(),
    ]);

  return {
    user: me.user,
    store: me.store,
    data: {
      products,
      stores,
      rows,
      requests,
      production,
      shiftReports: shifts,
      activities,
      settings,
    },
  };
}
