export const STORAGE_KEY = 'helcobali-dashboard-local-v1';
export const SESSION_KEY = 'helcobali-auth-session-v1';
export const DASH_LANG_KEY = 'helcobali-dashboard-lang-v1';

export const ADMIN_SEED = {
  name: 'Administrator',
  email: 'admin@helcobali.id',
  password: 'admin123',
};

export const STORE_STATUS = ['Diajukan', 'Disetujui', 'Ditolak'];
export const REQUEST_STATUS = ['Diajukan', 'Disetujui', 'Produksi', 'Dikirim', 'Diterima', 'Ditolak'];

export const newDashboardData = () => ({
  stores: [],
  products: [],
  rows: [],
  requests: [],
  production: [],
  activities: [],
  reviewed: [],
  users: [],
  shiftReports: [],
  settings: { minStock: null, expiryDays: 7 },
});

export function restoreDashboardData(raw) {
  if (!raw) return ensureSeedAdmin(newDashboardData());
  const data = JSON.parse(raw);
  const core = ['stores', 'products', 'rows', 'requests', 'production', 'activities', 'reviewed'];
  if (!data || typeof data !== 'object' || core.some((key) => !Array.isArray(data[key]))
    || !data.settings || !Number.isInteger(data.settings.expiryDays)
    || (data.settings.minStock !== null && !Number.isInteger(data.settings.minStock))) {
    throw new Error('Format data lokal tidak dikenali.');
  }
  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.shiftReports)) data.shiftReports = [];
  if (core.filter((key) => key !== 'reviewed').some((key) => data[key].some((entry) => entry === null || typeof entry !== 'object'))
    || data.reviewed.some((id) => typeof id !== 'string')
    || data.rows.some((row) => !Number.isFinite(row.physical) || !row.expires || !row.storeId || !row.productId)
    || data.requests.some((request) => !Array.isArray(request.allocations))) {
    throw new Error('Isi data lokal tidak lengkap.');
  }
  data.stores = data.stores.map(normalizeStore);
  data.requests = data.requests.map(normalizeRequest);
  data.products = (data.products || []).map(normalizeProduct);
  return ensureSeedAdmin(data);
}

export function normalizeStore(store) {
  if (!store || typeof store !== 'object') return store;
  return {
    location: '',
    ...store,
    status: STORE_STATUS.includes(store.status) ? store.status : 'Disetujui',
  };
}

export function normalizeRequest(request) {
  if (!request || typeof request !== 'object') return request;
  const out = {
    allocations: [],
    source: 'manual',
    lines: [],
    ...request,
  };
  if ((!out.lines || out.lines.length === 0) && out.productId && Number.isFinite(out.quantity)) {
    out.lines = [{ productId: out.productId, qty: out.quantity, price: out.price ?? 0 }];
  }
  return out;
}

export function ensureSeedAdmin(data) {
  if (!data.users.some((u) => u.email.toLocaleLowerCase() === ADMIN_SEED.email)) {
    return {
      ...data,
      users: [{ id: 'admin-seed', ...ADMIN_SEED, storeId: null, role: 'admin' }, ...data.users],
    };
  }
  return data;
}

export function findUserByEmail(data, email) {
  const norm = String(email || '').trim().toLocaleLowerCase();
  return (data.users || []).find((u) => String(u.email || '').toLocaleLowerCase() === norm) || null;
}

export function loginUser(data, email, password) {
  const user = findUserByEmail(data, email);
  if (!user || user.password !== password) throw new Error('Email atau kata sandi salah.');
  return user;
}

export function signupUser(data, { name, email, password, storeName, location }, makeId) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const cleanStore = String(storeName || '').trim();
  const cleanLocation = String(location || '').trim();
  if (!cleanName) throw new Error('Nama lengkap wajib diisi.');
  if (!/.+@.+\..+/.test(cleanEmail)) throw new Error('Format email tidak valid.');
  if (String(password || '').length < 6) throw new Error('Kata sandi minimal 6 karakter.');
  if (!cleanStore) throw new Error('Nama gerai wajib diisi.');
  if (!cleanLocation) throw new Error('Lokasi gerai wajib diisi.');
  if (findUserByEmail(data, cleanEmail)) throw new Error('Email sudah terdaftar. Silakan masuk.');
  if ((data.stores || []).some((s) => String(s.name || '').toLocaleLowerCase() === cleanStore.toLocaleLowerCase())) {
    throw new Error('Nama gerai sudah terdaftar.');
  }
  const id = makeId();
  const store = normalizeStore({ id: `store-${id.slice(0, 8)}`, name: cleanStore, location: cleanLocation, status: 'Diajukan', ownerEmail: cleanEmail.toLocaleLowerCase() });
  const user = { id: `user-${id.slice(0, 8)}`, name: cleanName, email: cleanEmail, password: String(password), storeId: store.id, role: 'staff' };
  return { data: { ...data, stores: [...data.stores, store], users: [...data.users, user] }, user, store };
}

export function approveStore(stores, id) {
  return (stores || []).map((s) => (s.id === id ? { ...s, status: 'Disetujui' } : s));
}

export function rejectStore(stores, id) {
  return (stores || []).map((s) => (s.id === id ? { ...s, status: 'Ditolak' } : s));
}

export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function daysUntil(date, now = new Date()) {
  return Math.round((new Date(`${date}T12:00:00`) - new Date(`${todayISO(now)}T12:00:00`)) / 86400000);
}

export const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0);
export const expectedStock = (row) => row.opening + row.received - row.sold - row.damaged - row.returned;

export function statusesFor(row, rows, settings, now = new Date()) {
  const statuses = [];
  const remaining = daysUntil(row.expires, now);
  if (row.physical === 0) statuses.push('Habis');
  else if (remaining < 0) statuses.push('Kedaluwarsa');
  else if (remaining <= settings.expiryDays) statuses.push('Segera kedaluwarsa');

  if (settings.minStock !== null && sum(rows.filter((item) => item.storeId === row.storeId), 'physical') <= settings.minStock) {
    statuses.push('Stok kritis');
  }
  return statuses.length ? statuses : ['Aman'];
}

export function allocateFEFO(batches, request, now = new Date()) {
  let remaining = request.quantity;
  const allocations = batches
    .filter((batch) => batch.productId === request.productId && batch.status === 'Siap kirim'
      && batch.available > 0 && daysUntil(batch.expires, now) >= 0)
    .sort((a, b) => a.expires.localeCompare(b.expires))
    .flatMap((batch) => {
      const quantity = Math.min(batch.available, remaining);
      remaining -= quantity;
      return quantity ? [{ batchId: batch.id, batch: batch.batch, quantity, expires: batch.expires }] : [];
    });
  return remaining === 0 ? allocations : null;
}

export function allocateLinesFEFO(batches, lines, now = new Date()) {
  const result = [];
  for (const line of lines || []) {
    const alloc = allocateFEFO(batches, { productId: line.productId, quantity: line.qty }, now);
    if (!alloc) return null;
    result.push({ productId: line.productId, qty: line.qty, allocations: alloc });
  }
  return result;
}

export const POS_TAX_RATE = 0.11;
export const POS_PAY_METHODS = ['Tunai', 'QRIS', 'Transfer'];

export const POS_SAMPLE_PRODUCTS = [
  { id: 'pos-1', name: 'LA KINTAMANI', price: 120000, stock: 36, image: '/product-kintamani.jpg', notes: 'Citrus, Floral, Bright Acidity', roast: 'Light Roast', origin: 'Kintamani' },
  { id: 'pos-2', name: 'LA PLAGA', price: 135000, stock: 8, image: '/product-plaga.jpg', notes: 'Dark Chocolate, Brown Sugar, Bold', roast: 'Medium-Dark Roast', origin: 'Plaga Highlands' },
  { id: 'pos-3', name: 'LA PUPUAN', price: 110000, stock: 52, image: '/product-pupuan.jpg', notes: 'Earthy, Nutty, Full Body', roast: 'Medium Roast', origin: 'Pupuan' },
];

export const CENTRAL_CATALOG = [
  {
    key: 'LA KINTAMANI', name: 'LA KINTAMANI', price: 120000, image: '/product-kintamani.jpg',
    notes: 'Citrus, Floral, Bright Acidity', roast: 'Light Roast', origin: 'Kintamani',
    descId: 'Single origin dari dataran tinggi Kintamani. Proses washed menonjolkan citrus cerah dan aroma floral — seduhan pagi yang menyegarkan.',
    descEn: 'Single origin from the Kintamani highlands. The washed process highlights bright citrus and delicate floral aroma — a refreshing morning brew.',
  },
  {
    key: 'LA PLAGA', name: 'LA PLAGA', price: 135000, image: '/product-plaga.jpg',
    notes: 'Dark Chocolate, Brown Sugar, Bold', roast: 'Medium-Dark Roast', origin: 'Plaga Highlands',
    descId: 'Signature house blend untuk seduhan harian. Fermentasi anaerobic natural memberi body syrupy, buah beri gelap, dan finish cokelat mewah.',
    descEn: 'The signature house blend for the perfect daily brew. Anaerobic natural fermentation brings syrupy body, dark berries, and a luxurious chocolate finish.',
  },
  {
    key: 'LA PUPUAN', name: 'LA PUPUAN', price: 110000, image: '/product-pupuan.jpg',
    notes: 'Earthy, Nutty, Full Body', roast: 'Medium Roast', origin: 'Pupuan',
    descId: 'Klasik robust dari tanah subur Pupuan. Full-bodied dengan earthy dan nutty yang menenangkan — cocok dipadukan susu.',
    descEn: 'A robust classic from the rich soils of Pupuan. Full-bodied with comforting earthy and nutty undertones — stands up well to milk.',
  },
];

export const PRODUCT_IMAGE_CHOICES = [
  '/product-kintamani.jpg',
  '/product-plaga.jpg',
  '/product-pupuan.jpg',
];

export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  return { image: null, notes: '', roast: '', origin: '', descId: '', descEn: '', ...product };
}

export function seedCentralCatalog(data, makeId) {
  const products = (data.products || []).map(normalizeProduct);
  const byName = new Map(products.map((p) => [String(p.name || '').toLocaleLowerCase(), p]));
  let changed = false;
  for (const seed of CENTRAL_CATALOG) {
    const existing = byName.get(seed.key.toLocaleLowerCase());
    if (existing) {
      const patch = { price: seed.price, image: seed.image, notes: seed.notes, roast: seed.roast, origin: seed.origin, descId: seed.descId, descEn: seed.descEn };
      if (Object.entries(patch).some(([key, value]) => existing[key] !== value)) {
        Object.assign(existing, patch);
        changed = true;
      }
    } else {
      const fresh = { id: makeId(), ...seed };
      delete fresh.key;
      products.push(fresh);
      byName.set(seed.key.toLocaleLowerCase(), fresh);
      changed = true;
    }
  }
  if (!changed) return data;
  return { ...data, products };
}

export function productInUse(data, productId) {
  const inRows = (data.rows || []).some((r) => r.productId === productId);
  const inActivities = (data.activities || []).some((a) => a.productId === productId);
  const inRequests = (data.requests || []).some((r) => normalizeRequest(r).lines.some((l) => l.productId === productId));
  const inProduction = (data.production || []).some((b) => b.productId === productId);
  const inShifts = (data.shiftReports || []).some((s) => (s.lines || []).some((l) => l.productId === productId));
  return inRows || inActivities || inRequests || inProduction || inShifts;
}

export function groupBatchesByRequest(production) {
  const groups = new Map();
  for (const batch of production || []) {
    const key = batch.requestId || '__manual__';
    if (!groups.has(key)) groups.set(key, { key, requestId: batch.requestId || null, batches: [] });
    groups.get(key).batches.push(batch);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.requestId && !b.requestId) return -1;
    if (!a.requestId && b.requestId) return 1;
    return 0;
  });
}

export function posCatalog(products, rows, storeId = '') {
  if (!Array.isArray(products) || products.length === 0) return [...POS_SAMPLE_PRODUCTS];
  return products.map((raw, index) => {
    const product = normalizeProduct(raw);
    const relevant = (rows || []).filter(
      (row) => row.productId === product.id && (!storeId || row.storeId === storeId),
    );
    const stock = relevant.length ? sum(relevant, 'physical') : null;
    return {
      id: product.id,
      name: product.name,
      price: product.price ?? null,
      stock,
      fallbackStock: stock === null,
      shortId: index + 1,
      image: product.image || POS_SAMPLE_PRODUCTS[index % POS_SAMPLE_PRODUCTS.length]?.image || null,
      notes: product.notes || '',
      roast: product.roast || '',
      origin: product.origin || '',
      descId: product.descId || '',
      descEn: product.descEn || '',
    };
  });
}

export function calcPosTotals(cart, discountRp = 0, taxRate = POS_TAX_RATE) {
  const subtotal = (cart || []).reduce(
    (total, item) => total + (item.price || 0) * (item.qty || 0),
    0,
  );
  const discount = Math.max(0, Math.min(Number(discountRp) || 0, subtotal));
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * taxRate);
  return { subtotal, discount, tax, total: taxable + tax };
}

export function calcPosChange(receivedRp = 0, total = 0) {
  return (Number(receivedRp) || 0) - (Number(total) || 0);
}

export function buildPosRequest({ storeId, cartDetailed, customer, method, totals, receiptId, date, makeId }) {
  const lines = (cartDetailed || []).map((line) => ({
    productId: line.productId,
    qty: line.qty,
    price: line.price || 0,
  }));
  if (!lines.length) throw new Error('Keranjang masih kosong.');
  return {
    id: makeId(),
    storeId,
    productId: lines[0].productId,
    quantity: lines.reduce((t, l) => t + l.qty, 0),
    price: lines[0].price,
    status: 'Diajukan',
    source: 'pos',
    lines,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    method,
    customer: customer || 'Walk-in',
    receiptId,
    created: date,
    note: `Order ${receiptId} · ${customer || 'Walk-in'} · ${method}`,
    allocations: [],
    received: [],
  };
}

export function approveRequestToProduction(data, requestId, { expires, makeId, date }) {
  const request = (data.requests || []).find((r) => r.id === requestId);
  if (!request || request.status !== 'Diajukan') return { data, created: [] };
  if (!expires || daysUntil(expires) < 0) throw new Error('Tanggal kedaluwarsa batch belum valid.');
  const lines = normalizeRequest(request).lines;
  const created = lines.map((line, index) => ({
    id: makeId(),
    batch: `B-${request.id.slice(0, 6).toUpperCase()}-${index + 1}`,
    requestId: request.id,
    storeId: request.storeId,
    productId: line.productId,
    quantity: line.qty,
    available: line.qty,
    expires,
    created: date,
    status: 'Diseduh',
  }));
  return {
    data: {
      ...data,
      production: [...created, ...data.production],
      requests: data.requests.map((r) => (r.id === requestId ? { ...normalizeRequest(r), status: 'Produksi' } : r)),
    },
    created,
  };
}

export function validateReceiptLines(shippedLines, inputLines) {
  for (const shipped of shippedLines || []) {
    const input = (inputLines || []).find((l) => l.productId === shipped.productId);
    const good = Number(input?.good) || 0;
    const retur = Number(input?.retur) || 0;
    if (!Number.isInteger(good) || !Number.isInteger(retur) || good < 0 || retur < 0) {
      return 'Jumlah siap jual dan retur harus bilangan bulat ≥ 0.';
    }
    if (good + retur !== shipped.qty) return 'Jumlah siap jual + retur harus sama dengan jumlah terkirim.';
  }
  return null;
}

export function applyReceipt(data, requestId, breakdown, { date, makeId }) {
  const request = normalizeRequest((data.requests || []).find((r) => r.id === requestId));
  if (!request || request.status !== 'Dikirim') throw new Error('Permintaan belum dikirim.');
  const shipped = request.allocations.length
    ? aggregateAllocations(request)
    : request.lines.map((l) => ({ productId: l.productId, qty: l.qty }));
  const error = validateReceiptLines(shipped, breakdown);
  if (error) throw new Error(error);
  const rows = data.rows.map((r) => ({ ...r }));
  const activities = [...data.activities];
  for (const line of shipped) {
    const input = breakdown.find((l) => l.productId === line.productId);
    const good = Number(input?.good) || 0;
    const retur = Number(input?.retur) || 0;
    if (good > 0) {
      const batchRef = request.allocations[0];
      const expires = batchRef?.expires || date;
      const batchName = batchRef?.batch || `B-${request.id.slice(0, 6).toUpperCase()}`;
      const existing = rows.find((r) => r.storeId === request.storeId && r.productId === line.productId && r.batch === batchName);
      if (existing) {
        existing.physical += good;
        existing.received += good;
      } else {
        rows.unshift({ id: makeId(), batch: batchName, storeId: request.storeId, productId: line.productId, opening: 0, received: good, sold: 0, damaged: 0, returned: 0, physical: good, expires });
      }
    }
    if (retur > 0) {
      activities.unshift({ id: makeId(), rowId: 'pos', storeId: request.storeId, productId: line.productId, batch: `B-${request.id.slice(0, 6).toUpperCase()}`, kind: 'retur', quantity: retur, date, note: `Retur penerimaan ${request.receiptId || request.id.slice(0, 8)}` });
    }
  }
  return {
    ...data,
    rows,
    activities,
    requests: data.requests.map((r) => (r.id === requestId ? { ...normalizeRequest(r), status: 'Diterima', received: breakdown } : r)),
  };
}

function aggregateAllocations(request) {
  // allocations tidak menyimpan productId; alokasi FEFO selalu penuh saat kirim,
  // sehingga jumlah terkirim per produk = qty lines pada request.
  return (request.lines || []).map((l) => ({ productId: l.productId, qty: l.qty }));
}

export function calcShiftReport(lines, actualTotal) {
  const expectedTotal = (lines || []).reduce((t, l) => t + (l.price || 0) * (l.qty || 0), 0);
  const actual = Number(actualTotal) || 0;
  return { expectedTotal, actualTotal: actual, difference: actual - expectedTotal };
}

export function applyShiftReport(data, { storeId, lines, actualTotal, note, date, makeId }) {
  const clean = (lines || []).filter((l) => (l.qty || 0) > 0);
  if (!clean.length) throw new Error('Isi jumlah terjual per produk terlebih dahulu.');
  for (const line of clean) {
    if (!Number.isInteger(line.qty) || line.qty < 1) throw new Error('Jumlah terjual harus bilangan bulat ≥ 1.');
    const stock = sum((data.rows || []).filter((r) => r.storeId === storeId && r.productId === line.productId), 'physical');
    if (line.qty > stock) throw new Error('Jumlah terjual melebihi stok gerai.');
  }
  const { expectedTotal, difference } = calcShiftReport(clean, actualTotal);
  const rows = data.rows.map((r) => ({ ...r }));
  const activities = [...data.activities];
  for (const line of clean) {
    let remaining = line.qty;
    const targets = rows
      .filter((r) => r.storeId === storeId && r.productId === line.productId && r.physical > 0)
      .sort((a, b) => a.expires.localeCompare(b.expires));
    for (const row of targets) {
      if (remaining <= 0) break;
      const taken = Math.min(row.physical, remaining);
      row.physical -= taken;
      row.sold += taken;
      remaining -= taken;
      activities.unshift({ id: makeId(), rowId: row.id, storeId, productId: line.productId, batch: row.batch, kind: 'terjual', quantity: taken, date, note: note || 'Tutup shift' });
    }
  }
  const report = {
    id: makeId(),
    storeId,
    date,
    lines: clean.map((l) => ({ productId: l.productId, qty: l.qty, price: l.price || 0, subtotal: (l.price || 0) * l.qty })),
    expectedTotal,
    actualTotal: Number(actualTotal) || 0,
    difference,
    note: note || '',
  };
  return { ...data, rows, activities, shiftReports: [report, ...(data.shiftReports || [])] };
}
