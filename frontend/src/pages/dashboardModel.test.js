import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateFEFO, allocateLinesFEFO, applyReceipt, applyShiftReport, approveRequestToProduction, approveStore, buildPosRequest, calcPosChange, calcPosTotals, calcShiftReport, CENTRAL_CATALOG, groupBatchesByRequest, loginUser, newDashboardData, normalizeRequest, posCatalog, POS_SAMPLE_PRODUCTS, productInUse, rejectStore, restoreDashboardData, seedCentralCatalog, signupUser, statusesFor, validateReceiptLines } from './dashboardModel.js';

let seq = 0;
const makeId = () => `test-id-${seq++}`;

const referenceDate = new Date(2026, 8, 24);

test('a critical store remains discoverable when all batches also expire soon', () => {
  const rows = [
    { storeId: 'store-a', physical: 4, expires: '2026-09-25' },
    { storeId: 'store-a', physical: 5, expires: '2026-09-26' },
  ];
  const settings = { minStock: 10, expiryDays: 30 };
  assert.deepEqual(statusesFor(rows[0], rows, settings, referenceDate), ['Segera kedaluwarsa', 'Stok kritis']);
  assert.equal(rows.filter((row) => statusesFor(row, rows, settings, referenceDate).includes('Stok kritis')).length, 2);
});

test('FEFO uses the oldest eligible batch first and never allocates an incomplete shipment', () => {
  const batches = [
    { id: 'later', batch: 'B', productId: 'coffee', status: 'Siap kirim', available: 4, expires: '2026-10-15' },
    { id: 'early', batch: 'A', productId: 'coffee', status: 'Siap kirim', available: 3, expires: '2026-10-01' },
    { id: 'expired', batch: 'X', productId: 'coffee', status: 'Siap kirim', available: 100, expires: '2026-09-20' },
  ];
  assert.deepEqual(allocateFEFO(batches, { productId: 'coffee', quantity: 5 }, referenceDate).map(({ batchId, quantity }) => [batchId, quantity]), [['early', 3], ['later', 2]]);
  assert.equal(allocateFEFO(batches, { productId: 'coffee', quantity: 8 }, referenceDate), null);
});

test('local state begins empty and malformed saved data is reported instead of fabricated', () => {
  const fresh = restoreDashboardData(null);
  assert.deepEqual({ ...fresh, users: [] }, { ...newDashboardData(), users: [] });
  assert.equal(fresh.users.length, 1);
  assert.equal(fresh.users[0].role, 'admin');
  assert.throws(() => restoreDashboardData('{"rows": []}'), /Format data lokal/);
  const roundtrip = restoreDashboardData(JSON.stringify(newDashboardData()));
  assert.deepEqual(roundtrip.stores, []);
  assert.equal(roundtrip.users.length, 1);
});

test('seeded admin can sign in to the admin dashboard', () => {
  const data = restoreDashboardData(null);
  const admin = loginUser(data, 'admin@helcobali.id', 'admin123');
  assert.equal(admin.role, 'admin');
  assert.throws(() => loginUser(data, 'admin@helcobali.id', 'salah'), /Email atau kata sandi salah/);
});

test('legacy rows without new fields migrate with defaults', () => {
  const legacy = { ...newDashboardData(), users: undefined, shiftReports: undefined, stores: [{ id: 's1', name: 'G1', location: 'L1' }] };
  const restored = restoreDashboardData(JSON.stringify(legacy));
  assert.deepEqual(restored.users.length, 1);
  assert.deepEqual(restored.shiftReports, []);
  assert.equal(restored.stores[0].status, 'Disetujui');
  assert.deepEqual(normalizeRequest({ id: 'r', productId: 'p', quantity: 3 }).lines, [{ productId: 'p', qty: 3, price: 0 }]);
});

test('signup creates pending store and login validates credentials', () => {
  let data = restoreDashboardData(null);
  const created = signupUser(data, { name: 'Angga', email: 'angga@gerai.id', password: 'rahasia1', storeName: 'AnggaPuspa.dev', location: 'Denpasar' }, makeId);
  data = created.data;
  assert.equal(created.store.status, 'Diajukan');
  assert.equal(created.user.role, 'staff');
  assert.throws(() => signupUser(data, { name: 'X', email: 'angga@gerai.id', password: 'rahasia1', storeName: 'Lain', location: 'L' }, makeId), /Email sudah terdaftar/);
  assert.throws(() => signupUser(data, { name: 'X', email: 'baru@gerai.id', password: 'rahasia1', storeName: 'AnggaPuspa.dev', location: 'L' }, makeId), /Nama gerai sudah terdaftar/);
  assert.equal(loginUser(data, 'angga@gerai.id', 'rahasia1').storeId, created.store.id);
  assert.throws(() => loginUser(data, 'angga@gerai.id', 'salah'), /Email atau kata sandi salah/);
  assert.deepEqual(approveStore(data.stores, created.store.id)[0].status, 'Disetujui');
  assert.deepEqual(rejectStore(data.stores, created.store.id)[0].status, 'Ditolak');
});

test('approve restock creates production once and receipt validates good+retur', () => {
  let data = restoreDashboardData(null);
  const cart = [{ productId: 'p1', qty: 5, price: 10000 }];
  const req = buildPosRequest({ storeId: 's1', cartDetailed: cart, customer: 'Walk-in', method: 'Transfer', totals: { subtotal: 50000, discount: 0, tax: 5500, total: 55500 }, receiptId: 'R1', date: '2026-10-04', makeId });
  data = { ...data, requests: [req] };
  const first = approveRequestToProduction(data, req.id, { expires: '2026-12-01', makeId, date: '2026-10-04' });
  assert.equal(first.created.length, 1);
  assert.equal(first.created[0].status, 'Diseduh');
  assert.equal(first.data.requests[0].status, 'Produksi');
  const second = approveRequestToProduction(first.data, req.id, { expires: '2026-12-01', makeId, date: '2026-10-04' });
  assert.equal(second.created.length, 0);
  assert.equal(validateReceiptLines([{ productId: 'p1', qty: 5 }], [{ productId: 'p1', good: 4, retur: 1 }]), null);
  assert.match(validateReceiptLines([{ productId: 'p1', qty: 5 }], [{ productId: 'p1', good: 4, retur: 2 }]), /sama dengan jumlah terkirim/);
  const shipped = { ...first.data, requests: first.data.requests.map((r) => ({ ...r, status: 'Dikirim' })) };
  const received = applyReceipt(shipped, req.id, [{ productId: 'p1', good: 4, retur: 1 }], { date: '2026-10-05', makeId });
  assert.equal(received.requests[0].status, 'Diterima');
  assert.equal(received.rows[0].physical, 4);
  assert.equal(received.activities.filter((a) => a.kind === 'retur').length, 1);
  assert.equal(received.activities.filter((a) => a.kind === 'terjual').length, 0);
});

test('allocateLinesFEFO covers multi-line orders atomically', () => {
  const batches = [
    { id: 'a1', batch: 'A1', productId: 'p1', status: 'Siap kirim', available: 5, expires: '2026-12-01' },
    { id: 'b1', batch: 'B1', productId: 'p2', status: 'Siap kirim', available: 2, expires: '2026-12-01' },
  ];
  assert.equal(allocateLinesFEFO(batches, [{ productId: 'p1', qty: 3 }, { productId: 'p2', qty: 2 }]).length, 2);
  assert.equal(allocateLinesFEFO(batches, [{ productId: 'p1', qty: 3 }, { productId: 'p2', qty: 9 }]), null);
});

test('shift report computes revenue and decrements stock', () => {
  let data = restoreDashboardData(null);
  data = { ...data, rows: [{ id: 'row1', batch: 'B1', storeId: 's1', productId: 'p1', opening: 10, received: 0, sold: 0, damaged: 0, returned: 0, physical: 10, expires: '2026-12-01' }] };
  const calc = calcShiftReport([{ price: 120000, qty: 2 }], 250000);
  assert.equal(calc.expectedTotal, 240000);
  assert.equal(calc.difference, 10000);
  const next = applyShiftReport(data, { storeId: 's1', lines: [{ productId: 'p1', qty: 2, price: 120000 }], actualTotal: 250000, note: 'Shift malam', date: '2026-10-04', makeId });
  assert.equal(next.rows[0].physical, 8);
  assert.equal(next.shiftReports.length, 1);
  assert.equal(next.shiftReports[0].difference, 10000);
  assert.equal(next.activities.filter((a) => a.kind === 'terjual').length, 1);
  assert.throws(() => applyShiftReport(next, { storeId: 's1', lines: [{ productId: 'p1', qty: 99, price: 1 }], actualTotal: 0, note: '', date: '2026-10-04', makeId }), /melebihi stok/);
});

test('catalog seed carries 3 coffees with images and normalizes legacy prices', () => {
  assert.equal(CENTRAL_CATALOG.length, 3);
  assert.deepEqual(CENTRAL_CATALOG.map((p) => p.price), [120000, 135000, 110000]);
  assert.ok(CENTRAL_CATALOG.every((p) => p.image && p.descId && p.descEn));
  let data = restoreDashboardData(null);
  data = seedCentralCatalog(data, makeId);
  assert.equal(data.products.length, 3);
  // Produk lama "La Plaga Rp 200" dinormalkan ke harga seed tanpa ganti id
  let dirty = restoreDashboardData(null);
  dirty = { ...dirty, products: [{ id: 'keep-id', name: 'La Plaga', price: 200 }] };
  const fixed = seedCentralCatalog(dirty, makeId);
  const plaga = fixed.products.find((p) => p.id === 'keep-id');
  assert.equal(plaga.price, 135000);
  assert.equal(plaga.image, '/product-plaga.jpg');
  assert.equal(seedCentralCatalog(fixed, makeId), fixed);
  assert.equal(productInUse({ rows: [], activities: [], requests: [], production: [], shiftReports: [] }, 'x'), false);
  assert.equal(productInUse({ rows: [{ productId: 'x' }], activities: [], requests: [], production: [], shiftReports: [] }, 'x'), true);
});

test('production batches group by order for the ship step', () => {
  const groups = groupBatchesByRequest([
    { id: 'b1', requestId: 'r1' },
    { id: 'b2', requestId: 'r1' },
    { id: 'b3', requestId: null },
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].requestId, 'r1');
  assert.equal(groups[0].batches.length, 2);
  assert.equal(groups[1].requestId, null);
});

test('POS catalog falls back to sample products and totals include 11% tax', () => {
  assert.equal(posCatalog([], []).length, 3);
  assert.deepEqual(posCatalog([], []).map((item) => item.name), POS_SAMPLE_PRODUCTS.map((item) => item.name));
  const cart = [{ price: 120000, qty: 2 }, { price: 85000, qty: 1 }];
  const totals = calcPosTotals(cart, 25000);
  assert.equal(totals.subtotal, 325000);
  assert.equal(totals.discount, 25000);
  assert.equal(totals.tax, Math.round(300000 * 0.11));
  assert.equal(totals.total, 300000 + totals.tax);
  assert.equal(calcPosChange(350000, totals.total), 350000 - totals.total);
  assert.equal(calcPosTotals(cart, 999999999).discount, 325000);
});
