export const DASH_LANG_KEY = 'helcobali-dashboard-lang-v1';

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

export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function daysUntil(date, now = new Date()) {
  return Math.round((new Date(`${date}T12:00:00`) - new Date(`${todayISO(now)}T12:00:00`)) / 86400000);
}

export const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0);
export const expectedStock = (row) => row.opening + row.received - row.sold - row.damaged - row.returned;

// Stok asli gerai per produk (0 bila belum ada rows). Jangan pakai fallback
// POS_SAMPLE_PRODUCTS untuk stok — fallback hanya untuk harga/gambar.
export function realStockFor(rows, productId, storeId = '') {
  return sum((rows || []).filter((r) => r.productId === productId && (!storeId || r.storeId === storeId)), 'physical');
}

// List barang yang dikirim untuk 1 request: qty + batch + expires + created.
// Scoping gerai ditangani pemanggil via request.storeId (staf hanya lihat miliknya).
export function shipmentLines(request, production = []) {
  const req = normalizeRequest(request);
  const batchById = new Map((production || []).map((b) => [b.id, b]));
  if (req.allocations && req.allocations.length) {
    return (req.lines || []).map((line) => {
      const allocs = req.allocations.filter((a) => a.productId === line.productId);
      const primary = allocs[0] || {};
      const created = primary.created
        || (primary.batchId ? batchById.get(primary.batchId)?.created : null)
        || req.created || null;
      return {
        productId: line.productId,
        qty: line.qty,
        batch: primary.batch || `B-${String(req.id || '').slice(0, 6).toUpperCase()}`,
        batchId: primary.batchId || null,
        expires: primary.expires || null,
        created,
        storeId: req.storeId,
        batches: allocs.map((a) => ({
          batchId: a.batchId || null,
          batch: a.batch,
          quantity: a.quantity,
          expires: a.expires || null,
          created: a.created || (a.batchId ? batchById.get(a.batchId)?.created : null) || req.created || null,
        })),
      };
    });
  }
  return (req.lines || []).map((line) => ({
    productId: line.productId,
    qty: line.qty,
    batch: `B-${String(req.id || '').slice(0, 6).toUpperCase()}`,
    batchId: null,
    expires: null,
    created: req.created || null,
    storeId: req.storeId,
    batches: [],
  }));
}

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

export const POS_TAX_RATE = 0.11;
export const POS_PAY_METHODS = ['Tunai', 'QRIS', 'Transfer'];

export const POS_SAMPLE_PRODUCTS = [
  { id: 'pos-1', name: 'LA KINTAMANI', price: 120000, stock: 36, image: '/product-kintamani.jpg', notes: 'Citrus, Floral, Bright Acidity', roast: 'Light Roast', origin: 'Kintamani' },
  { id: 'pos-2', name: 'LA PLAGA', price: 135000, stock: 8, image: '/product-plaga.jpg', notes: 'Dark Chocolate, Brown Sugar, Bold', roast: 'Medium-Dark Roast', origin: 'Plaga Highlands' },
  { id: 'pos-3', name: 'LA PUPUAN', price: 110000, stock: 52, image: '/product-pupuan.jpg', notes: 'Earthy, Nutty, Full Body', roast: 'Medium Roast', origin: 'Pupuan' },
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

export function calcShiftReport(lines, actualTotal) {
  const expectedTotal = (lines || []).reduce((t, l) => t + (l.price || 0) * (l.qty || 0), 0);
  const actual = Number(actualTotal) || 0;
  return { expectedTotal, actualTotal: actual, difference: actual - expectedTotal };
}
