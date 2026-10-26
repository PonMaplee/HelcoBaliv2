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
      Accept: 'application/json',
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

function withQuery(path, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value));
  });
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

/** Walk page/per_page until meta.last_page so callers still receive the full list. */
export async function fetchAll(path, params = {}) {
  const perPage = 100;
  let page = 1;
  let lastPage = 1;
  const all = [];
  do {
    const body = await request('GET', withQuery(path, { ...params, page, per_page: perPage }));
    const rows = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
    all.push(...rows);
    lastPage = Number(body?.meta?.last_page || 1);
    page += 1;
  } while (page <= lastPage);
  return all;
}

export const api = {
  request,
  // auth
  login: (email, password) => request('POST', '/login', { email, password }),
  register: (payload) => request('POST', '/register', payload),
  me: () => request('GET', '/me'),
  // reads — every page, so the dashboard calculations still see the full set
  products: (params) => fetchAll('/products', { sort: 'name', order: 'asc', ...params }),
  stores: (params) => fetchAll('/stores', { sort: 'name', order: 'asc', ...params }),
  rows: (params) => fetchAll('/rows', { sort: 'expires', order: 'asc', ...params }),
  requests: (params) => fetchAll('/requests', { sort: 'created', order: 'desc', ...params }),
  production: (params) => fetchAll('/production', { sort: 'expires', order: 'asc', ...params }),
  shifts: (params) => fetchAll('/shifts', { sort: 'date', order: 'desc', ...params }),
  activities: (params) => fetchAll('/activities', { sort: 'date', order: 'desc', ...params }),
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
