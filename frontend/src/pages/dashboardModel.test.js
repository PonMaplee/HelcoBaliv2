import test from 'node:test';
import assert from 'node:assert/strict';
import { calcPosChange, calcPosTotals, calcShiftReport, groupBatchesByRequest, newDashboardData, normalizeRequest, posCatalog, POS_SAMPLE_PRODUCTS, realStockFor, shipmentLines, statusesFor } from './dashboardModel.js';

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

test('legacy request lines are derived from productId and quantity', () => {
  assert.deepEqual(normalizeRequest({ id: 'r', productId: 'p', quantity: 3 }).lines, [{ productId: 'p', qty: 3, price: 0 }]);
  assert.deepEqual(newDashboardData().settings, { minStock: null, expiryDays: 7 });
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

test('shipment lines keep batch expiry and a new store has zero stock', () => {
  assert.equal(realStockFor([], 'p1', 's1'), 0);
  const lines = shipmentLines({
    id: 'req001',
    storeId: 's1',
    created: '2026-10-04',
    lines: [{ productId: 'p1', qty: 6, price: 10000 }],
    allocations: [{ productId: 'p1', batchId: 'b1', batch: 'B-REQ001-1', quantity: 6, expires: '2026-12-01', created: '2026-10-04' }],
  }, [{ id: 'b1', created: '2026-10-04' }]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].expires, '2026-12-01');
  assert.equal(lines[0].created, '2026-10-04');
  assert.equal(lines[0].qty, 6);
});

test('shift report computes expected cash against the counted total', () => {
  const calc = calcShiftReport([{ price: 120000, qty: 2 }], 250000);
  assert.equal(calc.expectedTotal, 240000);
  assert.equal(calc.difference, 10000);
});
