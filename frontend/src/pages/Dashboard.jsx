import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import bootstrapStylesheet from 'bootstrap/dist/css/bootstrap.min.css?url';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  DASH_LANG_KEY, calcPosChange, calcPosTotals,
  calcShiftReport, daysUntil, expectedStock, groupBatchesByRequest,
  newDashboardData, normalizeRequest, normalizeProduct, posCatalog, POS_PAY_METHODS,
  POS_SAMPLE_PRODUCTS, PRODUCT_IMAGE_CHOICES, realStockFor, shipmentLines, statusesFor,
  sum, todayISO,
} from './dashboardModel';
import { api, clearSession, getSession, loadDashboard } from './dashboardApi';
import { dashboardLocales } from '../locales';
import './Dashboard.css';

const NAV = [
  { id: 'ringkasan', labelKey: 'ringkasan', icon: 'house' },
  { id: 'stok', labelKey: 'stok', icon: 'boxes' },
  { id: 'restok', labelKey: 'restok', icon: 'file-earmark-text' },
  { id: 'produksi', labelKey: 'produksi', icon: 'truck', admin: true },
  { id: 'penjualan', labelKey: 'penjualan', icon: 'receipt' },
  { id: 'master', labelKey: 'master', icon: 'shop', admin: true },
  { id: 'order', labelKey: 'order', icon: 'cart', staffOnly: true },
  { id: 'shift', labelKey: 'shift', icon: 'clipboard-data', staffOnly: true },
];
const emptyFilters = () => ({ search: '', store: 'semua', product: 'semua', status: 'semua', until: '' });
const plus30 = () => { const d = new Date(); d.setDate(d.getDate() + 30); return todayISO(d); };

function EmptyState({ title, detail, action }) {
  return <div className="hb-empty" role="status"><h2 className="h5">{title}</h2><p className="mb-3">{detail}</p>{action}</div>;
}

function Status({ label, tone }) {
  return <span className={`hb-status hb-status-${tone || 'neutral'}`}>{label}</span>;
}

function toneFor(label) {
  if (['Habis', 'Kedaluwarsa', 'Ditolak', 'Selisih'].includes(label)) return 'danger';
  if (['Disetujui', 'Diterima', 'Siap kirim'].includes(label)) return 'success';
  return 'neutral';
}

function Heading({ title, detail, action }) {
  return <div className="hb-section-heading"><div><h2 className="h5 mb-1">{title}</h2>{detail && <p className="hb-muted mb-0">{detail}</p>}</div>{action}</div>;
}

function TrendChart({ activities, range, setRange, emptyTitle, emptyDetail }) {
  const canvasRef = useRef(null);
  const sales = activities.filter((item) => item.kind === 'terjual' || item.kind === 'retur');
  const series = useMemo(() => {
    const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
    const result = [];
    const now = new Date();
    for (let offset = range - 1; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setDate(day.getDate() - offset);
      const date = todayISO(day);
      const entries = activities.filter((item) => item.date === date);
      result.push({ date, label: shortDate.format(day), sold: sum(entries.filter((item) => item.kind === 'terjual'), 'quantity'), returned: sum(entries.filter((item) => item.kind === 'retur'), 'quantity') });
    }
    return result;
  }, [activities, range]);

  useEffect(() => {
    if (!canvasRef.current || !sales.length) return undefined;
    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: series.map((item) => item.label),
        datasets: [
          { label: 'Terjual', data: series.map((item) => item.sold), borderColor: '#806000', backgroundColor: '#d4af37', tension: 0, borderWidth: 2 },
          { label: 'Retur', data: series.map((item) => item.returned), borderColor: '#394047', backgroundColor: '#394047', tension: 0, borderWidth: 2 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
    });
    return () => chart.destroy();
  }, [sales.length, series]);

  return <section className="hb-panel hb-chart-panel" aria-labelledby="hb-chart-heading">
    <div className="hb-section-heading"><h2 id="hb-chart-heading" className="h5 mb-0">Penjualan & retur</h2><label className="visually-hidden" htmlFor="hb-range">Rentang grafik</label><select id="hb-range" className="form-select" value={range} onChange={(event) => setRange(Number(event.target.value))}><option value={7}>7 hari</option><option value={30}>30 hari</option><option value={90}>90 hari</option></select></div>
    {sales.length ? <><div className="hb-chart"><canvas ref={canvasRef} role="img" aria-label={`Grafik laporan penjualan dan retur, ${range} hari terakhir`} /></div><table className="visually-hidden"><caption>Data grafik penjualan dan retur</caption><thead><tr><th>Tanggal</th><th>Terjual</th><th>Retur</th></tr></thead><tbody>{series.map((item) => <tr key={item.date}><td>{item.date}</td><td>{item.sold}</td><td>{item.returned}</td></tr>)}</tbody></table></>
      : <EmptyState title={emptyTitle} detail={emptyDetail} />}
  </section>;
}

export default function Dashboard() {
  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(newDashboardData);
  const [currentUser, setCurrentUser] = useState(() => getSession()?.user ?? null);
  const [storageError, setStorageError] = useState('');
  const [cssReady, setCssReady] = useState(false);
  const [cssError, setCssError] = useState(false);
  const [dlang, setDlang] = useState(() => {
    try { return window.localStorage.getItem(DASH_LANG_KEY) === 'en' ? 'en' : 'id'; } catch { return 'id'; }
  });
  const [page, setPage] = useState('ringkasan');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [range, setRange] = useState(7);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [notice, setNotice] = useState('');
  const [posQuery, setPosQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [discountRp, setDiscountRp] = useState('');
  const [payMethod, setPayMethod] = useState('Tunai');
  const [received, setReceived] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [shiftQty, setShiftQty] = useState({});
  const [shiftCash, setShiftCash] = useState('');
  const [shiftNote, setShiftNote] = useState('');
  const modalRef = useRef(null);
  const sidebarRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const mainRef = useRef(null);

  const t = dashboardLocales[dlang] || dashboardLocales.id;
  const st = (label) => (t.status && t.status[label]) || label;
  const locale = dlang === 'en' ? 'en-US' : 'id-ID';
  const number = new Intl.NumberFormat(locale);
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const dateLabel = (value) => dateFormat.format(new Date(`${value}T12:00:00`));
  const money = (value) => currency.format(value || 0).replace(',00', '').replace('.00', '');
  const pdesc = (item) => (dlang === 'en' ? (item.descEn || item.descId || '') : (item.descId || item.descEn || ''));

  const loadData = useCallback(async () => {
    if (!getSession()?.token) { setCurrentUser(null); setPhase('ready'); return; }
    try {
      const { user, data: fresh } = await loadDashboard();
      setCurrentUser(user);
      setData(fresh);
      setStorageError('');
      setPhase('ready');
    } catch (err) {
      if (err.status === 401) { clearSession(); setCurrentUser(null); setPhase('ready'); }
      else setPhase('error');
    }
  }, []);

  useEffect(() => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = bootstrapStylesheet;
    stylesheet.onload = () => setCssReady(true);
    stylesheet.onerror = () => setCssError(true);
    document.head.appendChild(stylesheet);
    const oldTitle = document.title;
    document.title = 'Dashboard Kemitraan | HelcoBali';
    return () => { stylesheet.remove(); document.title = oldTitle; };
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);

  const mutate = async (promise) => {
    const res = await promise;
    setData((prev) => ({ ...prev, ...res }));
    return res;
  };

  useEffect(() => {
    if (!modal) return undefined;
    const previouslyFocused = document.activeElement;
    const panel = modalRef.current;
    (panel?.querySelector('input:not([disabled]), select:not([disabled]), button:not([disabled])') || panel)?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setModal(null); }
      if (event.key !== 'Tab') return;
      const focusables = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (!first) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (previouslyFocused?.isConnected) previouslyFocused.focus(); };
  }, [modal]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const opener = mobileTriggerRef.current;
    sidebarRef.current?.querySelector('button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false); }
      if (event.key !== 'Tab') return;
      const focusables = [...sidebarRef.current.querySelectorAll('button:not([disabled]), select:not([disabled])')];
      if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusables.at(-1)) { event.preventDefault(); focusables[0]?.focus(); }
    };
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); opener?.focus(); };
  }, [mobileOpen]);

  const isAdmin = currentUser?.role === 'admin';
  const myStore = !currentUser || isAdmin ? null : data.stores.find((s) => s.id === currentUser.storeId) || null;
  const storeApproved = isAdmin || (myStore && myStore.status === 'Disetujui');
  const waitingRejected = myStore && myStore.status === 'Ditolak';
  const selectedStore = isAdmin ? '' : (currentUser?.storeId || '');

  useEffect(() => {
    if (phase !== 'ready' || !currentUser || isAdmin || storeApproved) return undefined;
    const timer = window.setInterval(loadData, 4000);
    return () => window.clearInterval(timer);
  }, [phase, currentUser, isAdmin, storeApproved, loadData]);

  function toggleLang() {
    setDlang((prev) => {
      const next = prev === 'id' ? 'en' : 'id';
      try { window.localStorage.setItem(DASH_LANG_KEY, next); } catch { /* abaikan */ }
      return next;
    });
  }
  function logout() {
    clearSession();
    setCurrentUser(null);
    setPage('ringkasan');
  }

  const stores = data.stores;
  const products = data.products;
  const scopedStores = isAdmin ? stores : (myStore ? [myStore] : []);
  const scopedRows = isAdmin ? data.rows : data.rows.filter((row) => row.storeId === selectedStore);
  const scopedRequests = (isAdmin ? data.requests : data.requests.filter((request) => request.storeId === selectedStore)).map(normalizeRequest);
  const scopedActivities = isAdmin ? data.activities : data.activities.filter((item) => item.storeId === selectedStore);
  const scopedShifts = isAdmin ? (data.shiftReports || []) : (data.shiftReports || []).filter((s) => s.storeId === selectedStore);
  const storeName = (id) => stores.find((store) => store.id === id)?.name || 'Gerai tidak tersedia';
  const productName = (id) => products.find((product) => product.id === id)?.name || 'Produk tidak tersedia';
  const stockOf = (id) => sum(scopedRows.filter((row) => row.storeId === id), 'physical');
  const expiring = scopedRows.filter((row) => row.physical > 0 && daysUntil(row.expires) >= 0 && daysUntil(row.expires) <= data.settings.expiryDays);
  const criticalStores = data.settings.minStock === null ? [] : scopedStores.filter((store) => scopedRows.some((row) => row.storeId === store.id) && stockOf(store.id) <= data.settings.minStock);
  const pendingRequests = scopedRequests.filter((request) => request.status === 'Diajukan');
  const shippedPending = !isAdmin ? scopedRequests.filter((request) => request.status === 'Dikirim') : [];
  const monthlyReports = scopedActivities.filter((item) => item.kind === 'terjual' && item.date.slice(0, 7) === todayISO().slice(0, 7));
  const alerts = [
    ...(criticalStores.length ? [{ label: 'Stok kritis', detail: `${criticalStores.length} gerai perlu diperiksa`, target: 'stok' }] : []),
    ...(expiring.length ? [{ label: 'Segera kedaluwarsa', detail: `${expiring.length} batch perlu diperiksa`, target: 'stok' }] : []),
    ...(pendingRequests.length && isAdmin ? [{ label: 'Permintaan restok', detail: `${pendingRequests.length} permintaan menunggu tinjauan`, target: 'restok' }] : []),
    ...(shippedPending.length ? [{ label: 'Kiriman tiba', detail: `${shippedPending.length} kiriman menunggu konfirmasi penerimaan`, target: 'restok' }] : []),
  ];
  const filteredRows = scopedRows.filter((row) => {
    const query = filters.search.toLocaleLowerCase('id-ID').trim();
    return (!query || `${storeName(row.storeId)} ${productName(row.productId)} ${row.batch}`.toLocaleLowerCase('id-ID').includes(query))
      && (filters.store === 'semua' || row.storeId === filters.store)
      && (filters.product === 'semua' || row.productId === filters.product)
      && (filters.status === 'semua' || statusesFor(row, scopedRows, data.settings).includes(filters.status))
      && (!filters.until || row.expires <= filters.until);
  }).sort((a, b) => a.expires.localeCompare(b.expires));

  // ---- Pesan Stok (order B2B: tanpa validasi stok, bayar di muka) ----
  // Stok tampil = stok asli gerai (0 bila belum ada rows). Fallback sampel hanya
  // untuk harga/gambar, bukan stok — gerai baru harus nol semua.
  const posBaseRaw = posCatalog(products, scopedRows, selectedStore);
  const posUsingSample = products.length === 0;
  const posBaseCatalog = posBaseRaw.map((item, index) => {
    if (posUsingSample) return { ...item, shortId: index + 1, sample: true };
    const sampleFallback = POS_SAMPLE_PRODUCTS[index % POS_SAMPLE_PRODUCTS.length];
    return { ...item, price: item.price ?? sampleFallback.price, stock: item.stock ?? 0, shortId: index + 1, sample: !!item.fallbackStock };
  });
  const realStockOf = (productId) => realStockFor(data.rows, productId, selectedStore);
  const posQueryNorm = posQuery.toLocaleLowerCase('id-ID').trim();
  const posList = !posQueryNorm ? posBaseCatalog : posBaseCatalog.filter((item) => item.name.toLocaleLowerCase('id-ID').includes(posQueryNorm));
  const cartDetailed = cart.map((line) => {
    const found = posBaseCatalog.find((item) => item.id === line.productId);
    return { ...line, name: found?.name || 'Produk tidak tersedia', price: found?.price || 0, stock: found?.stock ?? 0 };
  });
  const posTotals = calcPosTotals(cartDetailed, Number(discountRp) || 0);
  const posChange = calcPosChange(Number(received) || 0, posTotals.total);

  function addToPos(product) {
    if (!product || !product.price) { setNotice(t.invalidQty); return; }
    setCart((previous) => {
      const existing = previous.find((line) => line.productId === product.id);
      if (existing) return previous.map((line) => line.productId === product.id ? { ...line, qty: Math.min(10000, line.qty + 1) } : line);
      return [...previous, { productId: product.id, qty: 1 }];
    });
    setNotice('');
  }
  function setCartQty(productId, qty) {
    const nextQty = Math.max(0, Math.min(10000, Number(qty) || 0));
    setCart((previous) => nextQty === 0 ? previous.filter((line) => line.productId !== productId) : previous.map((line) => line.productId === productId ? { ...line, qty: nextQty } : line));
  }
  function resetPosTransaction() {
    setCart([]); setCustomer(''); setDiscountRp(''); setReceived(''); setPayMethod('Tunai');
    setNotice(t.newReady);
  }
  async function checkoutPos() {
    if (!cartDetailed.length) { setNotice(t.orderEmpty); return; }
    if (posTotals.total <= 0) { setNotice(t.invalidQty); return; }
    if (payMethod === 'Tunai' && (received === '' || posChange < 0)) { setNotice(t.moneyShort); return; }
    try {
      const res = await mutate(api.createRequest({
        customer: customer.trim(),
        method: payMethod,
        discount: Number(discountRp) || 0,
        tax: posTotals.tax,
        total: posTotals.total,
        lines: cartDetailed.map((line) => ({ productId: line.productId, qty: line.qty, price: line.price })),
      }));
      const request = res.requests[0];
      const receipt = {
        id: request.id, receiptId: request.receiptId, date: request.created, store: storeName(selectedStore),
        customer: request.customer, method: payMethod, lines: cartDetailed.map((line) => ({ ...line })),
        ...posTotals, received: payMethod === 'Tunai' ? Number(received) || 0 : posTotals.total,
        change: payMethod === 'Tunai' ? posChange : 0,
      };
      setLastReceipt(receipt);
      setCart([]); setDiscountRp(''); setReceived('');
      openModal('struk', { receipt });
      setNotice(`${t.orderRecorded} Total ${money(receipt.total)}.`);
    } catch (err) { setNotice(err.message); }
  }

  function navigate(target, status) {
    setPage(target);
    setMobileOpen(false);
    if (status) setFilters((previous) => ({ ...previous, status }));
    window.requestAnimationFrame(() => mainRef.current?.focus());
    window.scrollTo(0, 0);
  }
  function openModal(type, values = {}) {
    setNotice('');
    setForm(values);
    setModal({ type });
  }
  async function submit(event) {
    event.preventDefault();
    const { type } = modal;
    try {
      if (type === 'product' || type === 'productEdit') {
        const name = form.name?.trim();
        if (!name) return;
        if (!Number.isInteger(Number(form.price)) || Number(form.price) < 1) return setNotice(t.invalidQty);
        const record = {
          name, price: Number(form.price),
          image: form.image?.trim() || null,
          notes: form.notes?.trim() || '',
          roast: form.roast?.trim() || '',
          origin: form.origin?.trim() || '',
          descId: form.descId?.trim() || '',
          descEn: form.descEn?.trim() || '',
        };
        if (type === 'product') await mutate(api.createProduct(record));
        else await mutate(api.updateProduct(form.id, record));
      } else if (type === 'batch' || type === 'production') {
        const quantity = Number(form.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) { setNotice(t.invalidQty); return; }
        const batch = form.batch?.trim();
        if (!batch || !form.expires || daysUntil(form.expires) < 0) return setNotice(t.invalidQty);
        if (type === 'batch') {
          if (!stores.some((store) => store.id === form.storeId) || !products.some((product) => product.id === form.productId)) return setNotice(t.invalidQty);
          await mutate(api.createRow({ storeId: form.storeId, productId: form.productId, batch, quantity, expires: form.expires }));
        } else {
          await mutate(api.createProduction({ productId: form.productId, batch, quantity, expires: form.expires }));
        }
      } else if (type === 'approve') {
        await mutate(api.approveRequest(form.requestId, { expires: form.expires }));
        setModal(null);
        setNotice(t.approved);
        return;
      } else if (type === 'receive') {
        await mutate(api.receiveRequest(form.requestId, { lines: form.lines.map((l) => ({ productId: l.productId, good: Number(l.good) || 0, retur: Number(l.retur) || 0 })) }));
        setModal(null);
        setNotice(t.receivedSaved);
        return;
      } else if (type === 'shiftEdit') {
        await mutate(api.reviseShift(form.reportId, {
          lines: (form.lines || []).map((l) => ({ productId: l.productId, qty: Number(l.qty) || 0, price: l.price || 0 })),
          actualTotal: Number(form.actualTotal) || 0,
          note: String(form.note || '').trim(),
        }));
        setModal(null);
        setNotice('Ralat shift disimpan.');
        return;
      } else if (type === 'settings') {
        const minStock = Number(form.minStock); const expiryDays = Number(form.expiryDays);
        if (!Number.isInteger(minStock) || minStock < 1 || minStock > 10000 || !Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 30) return setNotice(t.invalidQty);
        await mutate(api.updateSettings({ minStock, expiryDays }));
      }
      setModal(null);
      setNotice(t.updated);
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function rejectRequest(request) {
    try { await mutate(api.rejectRequest(request.id)); setNotice(t.rejected); }
    catch (err) { setNotice(err.message); }
  }
  async function shipRequest(request) {
    try { await mutate(api.shipRequest(request.id)); setNotice(t.updated); }
    catch (err) { setNotice(err.message); }
  }

  function requestLines(request) {
    return normalizeRequest(request).lines.map((line) => ({ ...line, name: productName(line.productId) }));
  }
  function shippedOf(request) {
    // List kiriman lengkap: qty + batch + expires + created, scoped via storeId request.
    return shipmentLines(request, data.production).map((l) => ({
      ...l, name: productName(l.productId),
    }));
  }

  function inventory(compact = false) {
    if (!scopedRows.length) return <section aria-label="Stok per gerai"><Heading title={t.nav.stok} detail={isAdmin ? 'Pantau semua stok semua gerai — diurutkan berdasarkan kedaluwarsa terdekat.' : 'Stok gerai Anda — diurutkan berdasarkan kedaluwarsa terdekat.'} /><EmptyState title="Belum ada batch stok" detail={isAdmin ? 'Belum ada kiriman yang diterima gerai mana pun. Stok muncul setelah gerai klik Terima.' : 'Stok masih nol. Buat pesanan di Pesan Stok, tunggu status Dikirim, lalu klik Terima.'} /></section>;
    const shown = compact ? filteredRows.slice(0, 5) : filteredRows;
    return <section aria-label="Stok per gerai"><Heading title={t.nav.stok} detail="Diurutkan berdasarkan kedaluwarsa terdekat." action={<div className="d-flex gap-2 flex-wrap">{compact && <button className="btn btn-outline-dark" onClick={() => navigate('stok')}>Lihat semua</button>}{!compact && isAdmin && <button className="btn hb-btn-gold" onClick={() => openModal('batch', { storeId: stores[0]?.id || '', productId: products[0]?.id || '', batch: '', quantity: '', expires: '' })}>Catat batch</button>}</div>} />
      <div className="hb-filters"><label className="visually-hidden" htmlFor={`hb-search-${compact}`}>Cari</label><input id={`hb-search-${compact}`} className="form-control" type="search" placeholder={t.searchStock} value={filters.search} onChange={(event) => setFilters((old) => ({ ...old, search: event.target.value }))} />{isAdmin && <select className="form-select" aria-label="Filter gerai" value={filters.store} onChange={(event) => setFilters((old) => ({ ...old, store: event.target.value }))}><option value="semua">Semua gerai</option>{stores.filter((s) => s.status === 'Disetujui').map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>}<select className="form-select" aria-label="Filter produk" value={filters.product} onChange={(event) => setFilters((old) => ({ ...old, product: event.target.value }))}><option value="semua">Semua produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
      {shown.length ? <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th scope="col">Gerai</th><th scope="col">Produk / batch</th><th scope="col">Stok fisik</th><th scope="col">Kedaluwarsa</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead><tbody>{shown.map((row) => <tr key={row.id}><td>{storeName(row.storeId)}</td><td><strong>{productName(row.productId)}</strong><span className="d-block hb-muted">{row.batch}</span></td><td>{number.format(row.physical)} botol</td><td>{dateLabel(row.expires)}</td><td><div className="hb-statuses">{statusesFor(row, scopedRows, data.settings).map((status) => <Status key={status} label={st(status)} tone={toneFor(status)} />)}</div></td><td><button className="btn btn-outline-dark" onClick={() => openModal('detail', { rowId: row.id })}>Detail</button></td></tr>)}</tbody></table></div> : <EmptyState title="Batch tidak ditemukan" detail="Coba ubah pencarian atau filter." action={<button className="btn btn-outline-dark" onClick={() => setFilters(emptyFilters())}>Hapus filter</button>} />}
    </section>;
  }

  function restock() {
    if (!scopedRequests.length) return <section><Heading title={t.nav.restok} detail={isAdmin ? 'Pesanan staf yang sudah dibayar. Setujui untuk diproduksi, atau tolak.' : 'Pesanan Anda ke pusat. Pantau status hingga kiriman tiba.'} /><EmptyState title="Belum ada permintaan" detail={isAdmin ? 'Pesanan dari gerai akan muncul di sini.' : 'Buat pesanan melalui menu Pesan Stok.'} /></section>;
    return <section><Heading title={t.nav.restok} detail={isAdmin ? 'Pesanan staf yang sudah dibayar. Setujui untuk diproduksi, atau tolak.' : 'Pesanan Anda ke pusat. Pantau status hingga kiriman tiba.'} />
      <div className="hb-request-grid">{scopedRequests.map((request) => {
        const lines = requestLines(request);
        return <article className="hb-panel" key={request.id}><div className="hb-section-heading"><div><h3 className="h6 mb-1">{request.receiptId || request.id.slice(0, 8)}</h3><p className="hb-muted mb-0">{storeName(request.storeId)} · {dateLabel(request.created)}{request.method ? ` · ${request.method}` : ''}{request.customer ? ` · ${request.customer}` : ''}</p></div><Status label={st(request.status)} tone={toneFor(request.status)} /></div>
          <ul className="hb-simple-list">{lines.map((line) => <li key={line.productId}><strong>{line.name}</strong><span className="hb-muted">{number.format(line.qty)} × {money(line.price)}</span></li>)}</ul>
          {request.total ? <p className="mb-2"><strong>Total: {money(request.total)}</strong></p> : <p className="mb-2">{number.format(request.quantity)} botol</p>}
          {request.note && <p className="hb-muted">{request.note}</p>}
          {request.allocations?.length > 0 && <ul className="hb-simple-list" aria-label="Barang dikirim">{shippedOf(request).map((s) => <li key={s.productId}><strong>{s.name}</strong><span className="hb-muted">{number.format(s.qty)} botol · {s.batch}{s.expires ? ` · Exp ${dateLabel(s.expires)}` : ''}{s.created ? ` · Dibuat ${dateLabel(s.created)}` : ''} · Untuk {storeName(request.storeId)}</span></li>)}</ul>}
          {request.received?.length > 0 && <p className="hb-muted">{t.received}: {request.received.map((item) => `${productName(item.productId)}: ${t.readyToSell} ${item.good}, ${t.retur} ${item.retur}`).join(' · ')}</p>}
          <div className="d-flex flex-wrap gap-2">
            {isAdmin && request.status === 'Diajukan' && <><button className="btn hb-btn-gold" onClick={() => openModal('approve', { requestId: request.id, expires: plus30() })}>{t.approveProduce}</button><button className="btn btn-outline-dark" onClick={() => rejectRequest(request)}>{t.reject}</button></>}
            {isAdmin && request.status === 'Produksi' && <span className="hb-muted">{t.inProduction}</span>}
            {!isAdmin && request.status === 'Dikirim' && <button className="btn hb-btn-gold" onClick={() => openModal('receive', { requestId: request.id, lines: shippedOf(request).map((l) => ({ ...l, good: l.qty, retur: 0 })) })}>{t.receive}</button>}
            {['Diterima', 'Ditolak'].includes(request.status) && <span className="hb-muted">Alur selesai</span>}
          </div>
        </article>;
      })}</div></section>;
  }

  function production() {
    const groups = groupBatchesByRequest([...data.production].sort((a, b) => a.expires.localeCompare(b.expires)));
    const markReady = async (batch) => { try { await mutate(api.markReady(batch.id)); setNotice(t.updated); } catch (err) { setNotice(err.message); } };
    const batchTable = (batches) => <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th scope="col">Batch</th><th scope="col">Produk</th><th scope="col">Kedaluwarsa</th><th scope="col">Tersedia</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td>{batch.batch}</td><td>{productName(batch.productId)}</td><td>{dateLabel(batch.expires)}</td><td>{number.format(batch.available)}</td><td><Status label={st(batch.status)} tone={toneFor(batch.status)} /></td><td>{batch.status === 'Diseduh' ? <button className="btn btn-outline-dark hb-btn-sm" onClick={() => markReady(batch)}>{t.markReady}</button> : <span className="hb-muted">{batch.available ? st('Siap kirim') : '—'}</span>}</td></tr>)}</tbody></table></div>;
    return <section><Heading title={t.nav.produksi} detail="Batch dari pesanan yang disetujui. Diseduh (lagi dibuat) → tandai siap → kirim ke gerai dari sini." action={products.length > 0 && <button className="btn hb-btn-gold" onClick={() => openModal('production', { productId: products[0].id, batch: '', quantity: '', expires: '' })}>Catat produksi</button>} />
      {groups.length ? groups.map((group) => {
        const request = group.requestId ? scopedRequests.find((r) => r.id === group.requestId) : null;
        const ready = group.batches.length > 0 && group.batches.every((b) => b.status === 'Siap kirim');
        return <div className="hb-panel mb-3" key={group.key}>
          <div className="hb-section-heading"><div><h3 className="h6 mb-1">{request ? (request.receiptId || request.id.slice(0, 8)) : 'Stok umum'}</h3><p className="hb-muted mb-0">{request ? `${storeName(request.storeId)} · ${dateLabel(request.created)}` : 'Batch cadangan tanpa pesanan'}</p></div>{request && <Status label={st(request.status)} tone={toneFor(request.status)} />}</div>
          {batchTable(group.batches)}
          {request && request.status === 'Produksi' && <div className="d-flex gap-2 align-items-center flex-wrap mt-2"><button className="btn hb-btn-gold" disabled={!ready} onClick={() => shipRequest(request)}>{t.ship}</button>{!ready && <span className="hb-muted">{t.shipHint}</span>}</div>}
        </div>;
      }) : <EmptyState title="Belum ada batch produksi" detail="Batch dibuat otomatis saat pesanan disetujui." />}
    </section>;
  }

  function reports() {
    const summaryStores = isAdmin
      ? (filters.store === 'semua' ? stores.filter((s) => s.status === 'Disetujui') : stores.filter((s) => s.id === filters.store))
      : scopedStores;
    return <section><Heading title={t.nav.penjualan} detail="Berasal dari tutup shift (terjual) dan penerimaan (retur). Read-only." action={isAdmin && <select className="form-select" aria-label="Filter gerai" style={{ width: 'auto' }} value={filters.store} onChange={(event) => setFilters((old) => ({ ...old, store: event.target.value }))}><option value="semua">Semua gerai</option>{stores.filter((s) => s.status === 'Disetujui').map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>} />
      <div className="hb-request-grid">{summaryStores.map((store) => {
        const acts = scopedActivities.filter((a) => a.storeId === store.id);
        const shifts = scopedShifts.filter((s) => s.storeId === store.id);
        const soldQty = sum(acts.filter((a) => a.kind === 'terjual'), 'quantity');
        const returQty = sum(acts.filter((a) => a.kind === 'retur'), 'quantity');
        const exp = shifts.reduce((s, r) => s + (r.expectedTotal || 0), 0);
        const act = shifts.reduce((s, r) => s + (r.actualTotal || 0), 0);
        return <article className="hb-panel" key={store.id}><div className="hb-section-heading"><div><h3 className="h6 mb-1">{store.name}</h3><p className="hb-muted mb-0">{store.location} · {shifts.length} shift</p></div></div>
          <dl className="hb-details">{[[t.sold, `${number.format(soldQty)}`], [t.retur, `${number.format(returQty)}`], [t.expectedCash, money(exp)], [t.actualCash.replace(' (Rp)', ''), money(act)], [t.difference, money(act - exp)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </article>;
      })}</div>
      <Heading title={t.shiftHistory} detail="" />
      {scopedActivities.length || scopedShifts.length ? <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th scope="col">Tanggal</th><th scope="col">Gerai</th><th scope="col">Produk / batch</th><th scope="col">Jenis</th><th scope="col">Jumlah</th></tr></thead><tbody>{[...scopedActivities].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <tr key={item.id}><td>{dateLabel(item.date)}</td><td>{storeName(item.storeId)}</td><td>{productName(item.productId)}<span className="d-block hb-muted">{item.batch}{item.note ? ` · ${item.note}` : ''}</span></td><td>{st(item.kind)}</td><td>{number.format(item.quantity)}</td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada laporan" detail="Laporan shift dan retur akan tampil di sini." />}
    </section>;
  }

  function masters() {
    const pending = stores.filter((s) => s.status === 'Diajukan');
    const active = stores.filter((s) => s.status === 'Disetujui');
    const rejected = stores.filter((s) => s.status === 'Ditolak');
    return <section><Heading title={t.nav.master} detail="Gerai dari pendaftaran mitra. Admin hanya menyetujui atau menolak." />
      <div className="hb-master-grid">
        <div className="hb-panel"><Heading title={`${t.storesPending} (${pending.length})`} />
          {pending.length ? <ul className="hb-simple-list">{pending.map((store) => <li key={store.id}><strong>{store.name}</strong><span className="hb-muted">{store.location}</span><span className="hb-muted">{store.ownerEmail}</span><div className="d-flex gap-2 mt-1"><button className="btn hb-btn-gold hb-btn-sm" onClick={async () => { try { await mutate(api.approveStore(store.id)); setNotice(t.storeApproved); } catch (err) { setNotice(err.message); } }}>{t.approveStore}</button><button className="btn btn-outline-dark hb-btn-sm" onClick={async () => { try { await mutate(api.rejectStore(store.id)); setNotice(t.storeRejected); } catch (err) { setNotice(err.message); } }}>{t.reject}</button></div></li>)}</ul> : <p className="hb-muted mb-0">—</p>}
        </div>
        <div className="hb-panel"><Heading title={`${t.storesActive} (${active.length})`} />
          {active.length ? <ul className="hb-simple-list">{active.map((store) => <li key={store.id}><strong>{store.name}</strong><span className="hb-muted">{store.location}</span></li>)}</ul> : <EmptyState title="Belum ada gerai" detail="Gerai yang disetujui akan tampil di sini." />}
          {rejected.length > 0 && <><Heading title={`${t.storesRejected} (${rejected.length})`} /><ul className="hb-simple-list">{rejected.map((store) => <li key={store.id}><strong>{store.name}</strong><span className="hb-muted">{store.location}</span></li>)}</ul></>}
        </div>
      </div>
      <div className="hb-panel mt-3"><Heading title="Produk" action={<div className="d-flex gap-2 flex-wrap"><button className="btn btn-outline-dark" onClick={async () => { try { await mutate(api.seedCatalog()); setNotice(t.catalogLoaded); } catch (err) { setNotice(err.message); } }}>{t.reloadCatalog}</button><button className="btn hb-btn-gold" onClick={() => openModal('product', { name: '', price: '', image: '', notes: '', roast: '', origin: '', descId: '', descEn: '' })}>Tambah produk</button></div>} />{products.length ? <ul className="hb-simple-list">{products.map((raw) => { const product = normalizeProduct(raw); return <li key={product.id} className="hb-product-row"><div className="d-flex gap-2 align-items-center">{product.image && <img src={product.image} alt={product.name} className="hb-thumb" loading="lazy" />}<div><strong>{product.name}</strong><span className="hb-muted d-block">{product.price ? money(product.price) : '—'}{product.notes ? ` · ${product.notes}` : ''}</span></div></div><div className="d-flex gap-2 mt-1"><button className="btn btn-outline-dark hb-btn-sm" onClick={() => openModal('productEdit', { id: product.id, name: product.name, price: product.price ?? '', image: product.image || '', notes: product.notes || '', roast: product.roast || '', origin: product.origin || '', descId: product.descId || '', descEn: product.descEn || '' })}>{t.edit}</button><button className="btn btn-outline-dark hb-btn-sm" onClick={async () => { if (window.confirm(`${t.del} ${product.name}?`)) { try { await mutate(api.deleteProduct(product.id)); setNotice(t.updated); } catch (err) { setNotice(err.message); } } }}>{t.del}</button></div></li>; })}</ul> : <EmptyState title="Belum ada produk" detail="Tambahkan produk katalog pusat." />}</div>
    </section>;
  }

  function order() {
    return <section aria-label="Pesan Stok"><div className="hb-pos-grid">
      <div className="hb-panel hb-catalog">
        <div className="hb-section-heading"><h2 className="h5 mb-0">{t.catalog}</h2><span className="hb-muted">{posList.length} {t.products}</span></div>
        {posList.length ? <div className="hb-catalog-grid">{posList.map((item) => <article className="hb-product" key={item.id}>
          {item.image && <img src={item.image} alt={item.name} className="hb-product-img" loading="lazy" />}
          <h3>{item.name}</h3>
          {(item.notes || item.roast) && <p className="hb-muted mb-1">{[item.notes, item.roast].filter(Boolean).join(' · ')}</p>}
          {pdesc(item) && <p className="hb-product-desc">{pdesc(item)}</p>}
          <p className="hb-product-price">{item.price ? money(item.price) : '—'}</p>
          <p className="hb-muted mb-2">{t.stock}: {item.stock ?? '—'} · ID {item.shortId}</p>
          <button className="btn hb-btn-gold w-100" type="button" disabled={!item.price} onClick={() => addToPos(item)}>{t.add}</button>
        </article>)}</div> : <EmptyState title="Produk tidak ditemukan" detail="Coba kata kunci lain pada pencarian atas." action={<button className="btn btn-outline-dark" onClick={() => setPosQuery('')}>Hapus pencarian</button>} />}
      </div>
      <aside className="hb-panel hb-cart" aria-label="Keranjang belanja">
        <div className="hb-section-heading"><h2 className="h5 mb-0">{t.cart}</h2><button className="btn btn-outline-dark hb-btn-sm" type="button" disabled={!cartDetailed.length} onClick={() => { setCart([]); setNotice(t.cleared); }}>{t.clear}</button></div>
        <label className="hb-cart-label" htmlFor="hb-pos-customer">{t.customerNote}</label>
        <input id="hb-pos-customer" className="form-control mb-2" placeholder={t.customerPh} maxLength={100} value={customer} onChange={(event) => setCustomer(event.target.value)} />
        {!cartDetailed.length ? <p className="hb-muted">{t.emptyCart}</p> : <ul className="hb-cart-list">{cartDetailed.map((line) => <li key={line.productId}>
          <div><strong>{line.name}</strong><span className="hb-muted d-block">{money(line.price)} × {line.qty} = {money(line.price * line.qty)}</span></div>
          <div className="hb-qty" role="group" aria-label={`Jumlah ${line.name}`}>
            <button type="button" aria-label="Kurangi" onClick={() => setCartQty(line.productId, line.qty - 1)}>−</button>
            <label className="visually-hidden" htmlFor={`hb-qty-${line.productId}`}>Jumlah {line.name}</label>
            <input id={`hb-qty-${line.productId}`} type="number" min="0" max="10000" value={line.qty} onChange={(event) => setCartQty(line.productId, event.target.value)} />
            <button type="button" aria-label="Tambah" onClick={() => setCartQty(line.productId, line.qty + 1)}>+</button>
            <button type="button" aria-label={`Hapus ${line.name}`} className="hb-remove" onClick={() => setCartQty(line.productId, 0)}><i className="bi bi-trash" aria-hidden="true" /></button>
          </div>
        </li>)}</ul>}
        <dl className="hb-totals">
          <div><dt>{t.subtotal}</dt><dd>{money(posTotals.subtotal)}</dd></div>
          <div className="hb-diskon"><dt><label htmlFor="hb-pos-diskon">{t.discount}</label></dt><dd><input id="hb-pos-diskon" className="form-control" type="number" min="0" max={posTotals.subtotal} step="500" placeholder="0" value={discountRp} onChange={(event) => setDiscountRp(event.target.value)} /></dd></div>
          <div><dt>{t.tax}</dt><dd>{money(posTotals.tax)}</dd></div>
          <div className="hb-grand"><dt>{t.total}</dt><dd>{money(posTotals.total)}</dd></div>
        </dl>
        <fieldset className="hb-pay"><legend>{t.payMethod}</legend><div className="hb-pay-options">{POS_PAY_METHODS.map((method) => <label key={method} className={payMethod === method ? 'hb-pay-active' : ''}><input className="form-check-input" type="radio" name="hb-pay" value={method} checked={payMethod === method} onChange={() => setPayMethod(method)} /> {method}</label>)}</div></fieldset>
        <label className="hb-cart-label" htmlFor="hb-pos-received">{t.received}</label>
        <input id="hb-pos-received" className="form-control mb-2" type="number" min="0" step="500" placeholder="0" disabled={payMethod !== 'Tunai'} value={payMethod === 'Tunai' ? received : posTotals.total} onChange={(event) => setReceived(event.target.value)} />
        <div className="hb-change"><span>{t.change}</span><strong>{money(Math.max(0, posChange))}</strong></div>
        <div className="hb-cart-actions"><button className="btn hb-btn-gold" type="button" disabled={!cartDetailed.length} onClick={checkoutPos}>{t.placeOrder}</button><button className="btn btn-outline-dark" type="button" disabled={!lastReceipt} onClick={() => lastReceipt && openModal('struk', { receipt: lastReceipt })}>{t.printReceipt}</button></div>
      </aside>
    </div></section>;
  }

  function shift() {
    const lines = posBaseCatalog.map((item) => ({ ...item, qty: Number(shiftQty[item.id]) || 0 })).filter((l) => l.qty > 0);
    const calc = calcShiftReport(lines, Number(shiftCash) || 0);
    const myShifts = scopedShifts;
    return <section><div className="hb-pos-grid">
      <div className="hb-panel"><div className="hb-section-heading"><h2 className="h5 mb-0">{t.nav.shift}</h2><span className="hb-muted">{myStore?.name}</span></div>
        {posBaseCatalog.length ? <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th scope="col">Produk</th><th scope="col">Stok</th><th scope="col">Harga</th><th scope="col">Terjual</th><th scope="col">Subtotal</th></tr></thead><tbody>{posBaseCatalog.map((item) => <tr key={item.id}><td><strong>{item.name}</strong>{item.sample && <span className="d-block hb-muted">Belum ada stok</span>}</td><td>{number.format(item.stock ?? 0)} botol</td><td>{item.price ? money(item.price) : '—'}</td><td><input className="form-control" style={{ maxWidth: 110 }} type="number" min="0" max={item.stock ?? 0} disabled={(item.stock ?? 0) <= 0} placeholder={(item.stock ?? 0) <= 0 ? '0' : ''} value={shiftQty[item.id] ?? ''} onChange={(event) => setShiftQty((old) => ({ ...old, [item.id]: event.target.value }))} aria-label={`Terjual ${item.name}`} /></td><td>{money((item.price || 0) * (Number(shiftQty[item.id]) || 0))}</td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada produk" detail="Katalog produk belum tersedia." />}
      </div>
      <aside className="hb-panel"><div className="hb-section-heading"><h2 className="h5 mb-0">{t.difference}</h2></div>
        <dl className="hb-totals">
          <div><dt>{t.expectedCash}</dt><dd>{money(calc.expectedTotal)}</dd></div>
          <div className="hb-diskon"><dt><label htmlFor="hb-shift-cash">{t.actualCash}</label></dt><dd><input id="hb-shift-cash" className="form-control" type="number" min="0" step="500" placeholder="0" value={shiftCash} onChange={(event) => setShiftCash(event.target.value)} /></dd></div>
          <div className="hb-grand"><dt>{t.difference}</dt><dd>{money(calc.difference)}</dd></div>
        </dl>
        <label className="hb-cart-label" htmlFor="hb-shift-note">Catatan (opsional)</label>
        <input id="hb-shift-note" className="form-control mb-2" maxLength={200} value={shiftNote} onChange={(event) => setShiftNote(event.target.value)} />
        <button className="btn hb-btn-gold w-100" type="button" disabled={!lines.length} onClick={async () => {
          try {
            await mutate(api.createShift({ lines: lines.map((l) => ({ productId: l.id, qty: l.qty, price: l.price })), actualTotal: Number(shiftCash) || 0, note: shiftNote.trim() }));
            setShiftQty({}); setShiftCash(''); setShiftNote('');
            setNotice(t.shiftSaved);
          } catch (err) { setNotice(err.message); }
        }}>{t.submitShift}</button>
      </aside>
    </div>
      <div className="hb-panel mt-3"><Heading title={t.shiftHistory} detail="Salah input? Klik Edit untuk meralat — stok otomatis dikoreksi." />
        {myShifts.length ? <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th scope="col">Tanggal</th><th scope="col">Rincian</th><th scope="col">Ekspektasi</th><th scope="col">Aktual</th><th scope="col">Selisih</th><th scope="col">Aksi</th></tr></thead><tbody>{[...myShifts].sort((a, b) => b.date.localeCompare(a.date)).map((s) => <tr key={s.id}><td>{dateLabel(s.date)}{s.editCount > 0 && <span className="d-block hb-muted">Ralat ×{s.editCount}</span>}</td><td>{s.lines.map((l) => `${productName(l.productId)} ×${l.qty}`).join(', ')}{s.note ? ` · ${s.note}` : ''}</td><td>{money(s.expectedTotal)}</td><td>{money(s.actualTotal)}</td><td>{money(s.difference)}</td><td><button className="btn btn-outline-dark hb-btn-sm" onClick={() => openModal('shiftEdit', { reportId: s.id, lines: s.lines.map((l) => ({ productId: l.productId, name: productName(l.productId), price: l.price, qty: l.qty })), actualTotal: s.actualTotal, note: s.note || '' })}>Edit</button></td></tr>)}</tbody></table></div> : <p className="hb-muted mb-0">—</p>}
      </div>
    </section>;
  }

  function modalBody() {
    if (modal.type === 'notifications') return <div className="modal-body">{alerts.length ? <div className="d-grid gap-2">{alerts.map((alert) => <button key={alert.label} className="hb-alert-action" onClick={() => { setModal(null); navigate(alert.target); }}><strong>{alert.label}</strong><span>{alert.detail}</span></button>)}</div> : <p className="mb-0">Belum ada peringatan.</p>}</div>;
    if (modal.type === 'struk') {
      const receipt = form.receipt || lastReceipt;
      if (!receipt) return <div className="modal-body">Belum ada struk.</div>;
      return <div className="modal-body hb-receipt">
        <p className="text-center mb-1"><strong>HelcoBali · {receipt.store}</strong><span className="d-block hb-muted">{dateLabel(receipt.date)} · {receipt.customer} · {receipt.method} · {receipt.receiptId}</span></p>
        <p className="text-center"><Status label={t.pendingApproval} tone="warning" /></p>
        <hr />
        {receipt.lines.map((line) => <div key={line.productId} className="hb-receipt-line"><span>{line.name} × {line.qty}</span><span>{money(line.price * line.qty)}</span></div>)}
        <hr />
        <div className="hb-receipt-line"><span>{t.subtotal}</span><span>{money(receipt.subtotal)}</span></div>
        <div className="hb-receipt-line"><span>{t.discount.replace(' (Rp)', '')}</span><span>{money(receipt.discount)}</span></div>
        <div className="hb-receipt-line"><span>{t.tax}</span><span>{money(receipt.tax)}</span></div>
        <div className="hb-receipt-line hb-grand"><span>{t.total}</span><span>{money(receipt.total)}</span></div>
        <div className="hb-receipt-line"><span>{t.received.replace(' (Rp)', '')}</span><span>{money(receipt.received)}</span></div>
        <div className="hb-receipt-line"><span>{t.change}</span><span>{money(receipt.method === 'Tunai' ? Math.max(0, receipt.received - receipt.total) : 0)}</span></div>
        <div className="d-flex gap-2 mt-3"><button className="btn hb-btn-gold flex-fill" type="button" onClick={() => window.print()}>{t.printReceipt}</button><button className="btn btn-outline-dark flex-fill" type="button" onClick={() => setModal(null)}>{t.close}</button></div>
      </div>;
    }
    if (modal.type === 'approve') {
      const request = scopedRequests.find((r) => r.id === form.requestId);
      if (!request) return <div className="modal-body">—</div>;
      return <form id="hb-modal-form" onSubmit={submit}><div className="modal-body hb-form">
        <ul className="hb-simple-list">{requestLines(request).map((line) => <li key={line.productId}><strong>{line.name}</strong><span className="hb-muted">{number.format(line.qty)} × {money(line.price)}</span></li>)}</ul>
        <label htmlFor="hb-expires">{t.batchExpiry}</label>
        <input id="hb-expires" className="form-control" type="date" min={todayISO()} required value={form.expires} onChange={(event) => setForm((old) => ({ ...old, expires: event.target.value }))} />
      </div></form>;
    }
    if (modal.type === 'receive') {
      return <form id="hb-modal-form" onSubmit={submit}><div className="modal-body hb-form">
        <p className="hb-muted">Stok bertambah setelah Terima disimpan. Pastikan siap jual + retur = terkirim.</p>
        {(form.lines || []).map((line) => <div key={line.productId} className="hb-receive-row">
          <strong>{line.name}</strong><span className="hb-muted d-block">{t.shipped}: {number.format(line.qty)} botol · {line.batch}{line.expires ? ` · Exp ${dateLabel(line.expires)}` : ''}{line.created ? ` · Dibuat ${dateLabel(line.created)}` : ''}</span>
          <div className="hb-receive-inputs">
            <div><label htmlFor={`hb-good-${line.productId}`}>{t.readyToSell}</label><input id={`hb-good-${line.productId}`} className="form-control" type="number" min="0" max={line.qty} required value={line.good} onChange={(event) => setForm((old) => ({ ...old, lines: old.lines.map((l) => l.productId === line.productId ? { ...l, good: event.target.value } : l) }))} /></div>
            <div><label htmlFor={`hb-retur-${line.productId}`}>{t.retur}</label><input id={`hb-retur-${line.productId}`} className="form-control" type="number" min="0" max={line.qty} required value={line.retur} onChange={(event) => setForm((old) => ({ ...old, lines: old.lines.map((l) => l.productId === line.productId ? { ...l, retur: event.target.value } : l) }))} /></div>
          </div>
        </div>)}
      </div></form>;
    }
    if (modal.type === 'shiftEdit') {
      const report = (data.shiftReports || []).find((s) => s.id === form.reportId);
      const maxFor = (productId) => realStockFor(data.rows, productId, selectedStore) + ((report?.lines || []).find((l) => l.productId === productId)?.qty || 0);
      return <form id="hb-modal-form" onSubmit={submit}><div className="modal-body hb-form">
        <p className="hb-muted">Ralat laporan {report ? dateLabel(report.date) : ''} — stok otomatis dikoreksi dan tercatat sebagai koreksi.</p>
        {(form.lines || []).map((line) => <div key={line.productId} className="hb-receive-row">
          <strong>{line.name || productName(line.productId)}</strong><span className="hb-muted d-block">Stok tersedia (termasuk yang lama): {number.format(maxFor(line.productId))} botol</span>
          <div><label htmlFor={`hb-shift-edit-${line.productId}`}>Terjual</label><input id={`hb-shift-edit-${line.productId}`} className="form-control" type="number" min="1" max={maxFor(line.productId)} required value={line.qty} onChange={(event) => setForm((old) => ({ ...old, lines: old.lines.map((l) => l.productId === line.productId ? { ...l, qty: event.target.value } : l) }))} /></div>
        </div>)}
        <label htmlFor="hb-shift-edit-cash">{t.actualCash}</label>
        <input id="hb-shift-edit-cash" className="form-control" type="number" min="0" step="500" value={form.actualTotal ?? ''} onChange={(event) => setForm((old) => ({ ...old, actualTotal: event.target.value }))} />
        <label htmlFor="hb-shift-edit-note">Catatan</label>
        <input id="hb-shift-edit-note" className="form-control" maxLength={200} value={form.note || ''} onChange={(event) => setForm((old) => ({ ...old, note: event.target.value }))} />
      </div></form>;
    }
    if (modal.type === 'detail') {
      const row = scopedRows.find((item) => item.id === form.rowId);
      if (!row) return <div className="modal-body">Batch tidak tersedia.</div>;
      return <div className="modal-body"><p>{storeName(row.storeId)} · {productName(row.productId)}</p><p>Batch {row.batch}, kedaluwarsa {dateLabel(row.expires)}</p><dl className="hb-details">{[['Stok awal', row.opening], ['Diterima', row.received], ['Terjual', row.sold], ['Rusak', row.damaged], ['Retur', row.returned], ['Stok seharusnya', expectedStock(row)], ['Stok fisik', row.physical], ['Selisih', row.physical - expectedStock(row)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number.format(value)}</dd></div>)}</dl></div>;
    }
    return <form id="hb-modal-form" onSubmit={submit}><div className="modal-body hb-form">
      {['product', 'productEdit'].includes(modal.type) && <><label htmlFor="hb-name">Nama produk</label><input id="hb-name" className="form-control" required maxLength={100} value={form.name} onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))} /><label htmlFor="hb-price">Harga per pcs (Rp, wajib)</label><input id="hb-price" className="form-control" type="number" min="1" step="500" required value={form.price} onChange={(event) => setForm((old) => ({ ...old, price: event.target.value }))} /><label htmlFor="hb-image">{t.imageLabel}</label><input id="hb-image" className="form-control" list="hb-image-choices" maxLength={200} placeholder="/product-kintamani.jpg" value={form.image} onChange={(event) => setForm((old) => ({ ...old, image: event.target.value }))} /><datalist id="hb-image-choices">{PRODUCT_IMAGE_CHOICES.map((src) => <option key={src} value={src} />)}</datalist><label htmlFor="hb-notes">{t.notesLabel}</label><input id="hb-notes" className="form-control" maxLength={160} value={form.notes} onChange={(event) => setForm((old) => ({ ...old, notes: event.target.value }))} /><label htmlFor="hb-desc-id">{t.descIdLabel}</label><textarea id="hb-desc-id" className="form-control" rows={3} maxLength={500} value={form.descId} onChange={(event) => setForm((old) => ({ ...old, descId: event.target.value }))} /><label htmlFor="hb-desc-en">{t.descEnLabel}</label><textarea id="hb-desc-en" className="form-control" rows={3} maxLength={500} value={form.descEn} onChange={(event) => setForm((old) => ({ ...old, descEn: event.target.value }))} /></>}
      {['batch', 'production'].includes(modal.type) && <><label htmlFor="hb-product">Produk</label><select id="hb-product" className="form-select" value={form.productId} onChange={(event) => setForm((old) => ({ ...old, productId: event.target.value }))}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><label htmlFor="hb-batch">Nomor batch</label><input id="hb-batch" className="form-control" required maxLength={80} value={form.batch} onChange={(event) => setForm((old) => ({ ...old, batch: event.target.value }))} /><label htmlFor="hb-expires">Tanggal kedaluwarsa</label><input id="hb-expires" className="form-control" type="date" min={todayISO()} required value={form.expires} onChange={(event) => setForm((old) => ({ ...old, expires: event.target.value }))} /></>}
      {modal.type === 'batch' && <><label htmlFor="hb-store">Gerai</label><select id="hb-store" className="form-select" value={form.storeId} onChange={(event) => setForm((old) => ({ ...old, storeId: event.target.value }))}>{stores.filter((s) => s.status === 'Disetujui').map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></>}
      {['batch', 'production'].includes(modal.type) && <><label htmlFor="hb-quantity">Jumlah</label><input id="hb-quantity" className="form-control" type="number" min="1" max="10000" step="1" required value={form.quantity} onChange={(event) => setForm((old) => ({ ...old, quantity: event.target.value }))} /></>}
      {modal.type === 'settings' && <><label htmlFor="hb-threshold">Stok minimum per gerai</label><input id="hb-threshold" className="form-control" type="number" min="1" max="10000" required value={form.minStock} onChange={(event) => setForm((old) => ({ ...old, minStock: event.target.value }))} /><label htmlFor="hb-expiry">Peringatan kedaluwarsa (hari)</label><input id="hb-expiry" className="form-control" type="number" min="1" max="30" required value={form.expiryDays} onChange={(event) => setForm((old) => ({ ...old, expiryDays: event.target.value }))} /></>}
    </div></form>;
  }

  const modalTitle = { notifications: 'Peringatan', detail: 'Detail batch', product: 'Tambah produk', productEdit: t.editProduct, batch: 'Catat batch stok', production: 'Catat batch produksi', settings: 'Atur batas peringatan', struk: t.orderReceipt, approve: t.approveProduce, receive: t.receive, shiftEdit: 'Ralat laporan shift' };
  const modalSubmitLabel = { approve: t.approveProduce, receive: t.receive, shiftEdit: 'Simpan ralat' };
  const visibleNav = NAV.filter((item) => (isAdmin ? !item.staffOnly : !item.admin));
  const activeLabel = t.nav[visibleNav.find((item) => item.id === page)?.labelKey] || '';
  const isOrderPage = page === 'order';
  const pageOverline = isOrderPage ? t.overline.order : page === 'shift' ? t.overline.shift : (isAdmin ? t.overline.admin : t.overline.staff);
  const pageSubtitle = isOrderPage ? t.subtitle.order : page === 'shift' ? t.subtitle.shift : t.subtitle.default;

  if (cssError) return <div className="hb-dashboard hb-wait" role="alert">Tampilan dashboard gagal dimuat. <button onClick={() => window.location.reload()}>Coba lagi</button></div>;
  if (phase === 'loading' || !cssReady) return <div className="hb-dashboard hb-wait" role="status">Menyiapkan dashboard...</div>;
  if (phase === 'error') return <div className="hb-dashboard hb-wait" role="alert"><p>Data tidak dapat dimuat.</p><button className="btn btn-outline-dark me-2" onClick={() => { setPhase('loading'); loadData(); }}>Coba lagi</button></div>;

  if (!currentUser) {
    return <div className="hb-dashboard" data-bs-theme="light"><div className="hb-wait hb-gate" role="status">
      <h1 className="h4">{t.needLoginTitle}</h1><p className="hb-muted">{t.needLoginDetail}</p>
      <div className="d-flex gap-2 justify-content-center"><Link className="btn hb-btn-gold" to="/login">Masuk / Sign in</Link><Link className="btn btn-outline-dark" to="/signup">Daftar / Sign up</Link></div>
    </div></div>;
  }

  if (!storeApproved) {
    return <div className="hb-dashboard" data-bs-theme="light"><div className="hb-wait hb-gate" role="status">
      <h1 className="h4">{waitingRejected ? t.waitingRejectedTitle : t.waitingTitle}</h1>
      <p className="hb-muted">{waitingRejected ? t.waitingRejectedDetail : t.waitingDetail}</p>
      <p className="hb-muted">{myStore ? `${myStore.name} · ${myStore.location}` : ''}</p>
      <div className="d-flex gap-2 justify-content-center flex-wrap"><button className="btn hb-btn-gold" onClick={loadData}>{t.recheck}</button><button className="btn btn-outline-dark" onClick={logout}>{t.logout}</button><Link className="btn btn-outline-dark" to="/">{t.backToShop}</Link></div>
    </div></div>;
  }

  return <div className="hb-dashboard" data-bs-theme="light">
    <div className="hb-shell" inert={modal ? true : undefined}>
      <header className="hb-topbar" inert={mobileOpen ? true : undefined}><div className="hb-brand"><button ref={mobileTriggerRef} className="hb-menu-toggle d-md-none" type="button" aria-label="Buka navigasi" aria-controls="hb-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><button type="button" className="hb-wordmark" onClick={() => navigate('ringkasan')}>HelcoBali</button><span className="hb-local-marker">{t.localMarker}</span></div>{isOrderPage ? <label className="hb-top-search"><span className="visually-hidden">Cari produk</span><i className="bi bi-search" aria-hidden="true" /><input className="form-control" type="search" placeholder={t.searchOrder} value={posQuery} onChange={(event) => setPosQuery(event.target.value)} /></label> : <label className="hb-top-search"><span className="visually-hidden">Cari stok</span><i className="bi bi-search" aria-hidden="true" /><input className="form-control" type="search" placeholder={t.searchStock} value={filters.search} onChange={(event) => { setFilters((old) => ({ ...old, search: event.target.value })); if (event.target.value) navigate('stok'); }} /></label>}<div className="hb-top-actions"><button className="hb-notify" type="button" aria-label="Buka peringatan" onClick={() => openModal('notifications')}><i className="bi bi-bell" aria-hidden="true" />{alerts.length > 0 && <span className="visually-hidden">Ada peringatan</span>}</button><button className="btn btn-outline-dark hb-btn-sm" type="button" onClick={toggleLang} aria-label="Switch language">{dlang === 'id' ? 'EN' : 'ID'}</button><span className="hb-user">{isAdmin ? currentUser.name : `${myStore?.name}`} </span><button className="btn btn-outline-dark hb-btn-sm" type="button" onClick={logout}>{t.logout}</button></div></header>
      {mobileOpen && <div className="hb-mobile-backdrop d-md-none" role="presentation" onClick={() => setMobileOpen(false)} />}
      <div className="hb-layout"><aside ref={sidebarRef} id="hb-sidebar" className={`hb-sidebar ${mobileOpen ? 'hb-sidebar-open' : ''}`} aria-label="Navigasi dashboard" inert={modal ? true : undefined}><div className="hb-sidebar-head d-md-none"><strong>Menu dashboard</strong><button className="hb-icon-button" type="button" aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><nav>{visibleNav.map((item) => <button key={item.id} type="button" className={`hb-nav-item ${page === item.id ? 'hb-nav-active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><i className={`bi bi-${item.icon}`} aria-hidden="true" /><span>{t.nav[item.labelKey]}</span></button>)}</nav><div className="hb-sidebar-foot">{isOrderPage && <p>{t.sidebarB2B}</p>}<p>{t.savedLocal}</p><Link to="/">{t.backToShop}</Link></div></aside>
        <main ref={mainRef} className="hb-main" tabIndex={-1} inert={mobileOpen ? true : undefined}><div className="hb-page-head"><div><p className="hb-overline">{pageOverline}</p><h1>{isOrderPage ? t.nav.order : activeLabel}</h1><p className="hb-muted mb-0">{pageSubtitle}</p></div>{isOrderPage && <button className="btn btn-outline-dark" onClick={resetPosTransaction}>{t.newTransaction}</button>}</div>
          {storageError && <div className="alert alert-danger" role="alert">{storageError}</div>}
          {page === 'ringkasan' && <><section aria-label="Ringkasan" className="hb-summary">{scopedRows.length || scopedActivities.length || scopedRequests.length ? <div className="hb-metrics"><div><span>Total stok tercatat</span><strong>{scopedRows.length ? `${number.format(sum(scopedRows, 'physical'))} botol` : 'Belum dicatat'}</strong></div><div><span>Terjual bulan ini</span><strong>{monthlyReports.length ? `${number.format(sum(monthlyReports, 'quantity'))} botol` : 'Belum dilaporkan'}</strong></div><div><span>Mendekati kedaluwarsa</span><strong>{scopedRows.length ? `${number.format(expiring.length)} batch` : 'Belum dicatat'}</strong></div><div><span>Restok menunggu</span><strong>{scopedRequests.length ? `${number.format(pendingRequests.length)} permintaan` : 'Belum diajukan'}</strong></div></div> : <EmptyState title="Belum ada data" detail="Data akan terisi dari alur pemesanan dan laporan." />}</section><div className="hb-overview-grid"><TrendChart activities={scopedActivities} range={range} setRange={setRange} emptyTitle="Belum ada laporan" emptyDetail="Grafik akan tersedia setelah laporan tercatat." /><section className="hb-panel"><Heading title="Perlu ditindaklanjuti" action={isAdmin && <button className="btn btn-outline-dark" onClick={() => openModal('settings', { minStock: data.settings.minStock ?? '', expiryDays: data.settings.expiryDays })}>Atur batas</button>} />{alerts.length ? <div className="hb-attention">{alerts.map((alert) => <button key={alert.label} onClick={() => navigate(alert.target)}><strong>{alert.label}</strong><span>{alert.detail}</span></button>)}</div> : <p className="hb-muted mb-0">Belum ada peringatan.</p>}</section></div>{inventory(true)}</>}
          {page === 'stok' && <>{inventory()}</>}
          {page === 'restok' && restock()}
          {page === 'produksi' && isAdmin && production()}
          {page === 'penjualan' && reports()}
          {page === 'master' && isAdmin && masters()}
          {page === 'order' && !isAdmin && <>{order()}</>}
          {page === 'shift' && !isAdmin && <>{shift()}</>}
          <footer className="hb-footer">{isOrderPage ? t.footerOrder : t.footerDefault}</footer>
        </main>
      </div>
    </div>
    {notice && !modal && <div className="hb-toast" role="status"><span>{notice}</span><button className="hb-icon-button" type="button" aria-label="Tutup pesan" onClick={() => setNotice('')}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>}
    {modal && <><div className="hb-modal-backdrop" role="presentation" /><div className="hb-modal-layer" onClick={(event) => { if (event.target === event.currentTarget) setModal(null); }}><div ref={modalRef} className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="dialog" aria-modal="true" aria-labelledby="hb-modal-heading" tabIndex={-1}><div className="modal-content"><div className="modal-header"><h2 className="modal-title h5 mb-0" id="hb-modal-heading">{modalTitle[modal.type]}</h2><button className="hb-icon-button" type="button" aria-label="Tutup dialog" onClick={() => setModal(null)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>{notice && <div className="hb-modal-alert" role="alert">{notice}</div>}{modalBody()}<div className="modal-footer"><button className="btn btn-outline-dark" type="button" onClick={() => setModal(null)}>{t.close}</button>{!['notifications', 'detail', 'struk'].includes(modal.type) && <button className="btn hb-btn-gold" type="submit" form="hb-modal-form">{modalSubmitLabel[modal.type] || t.save}</button>}</div></div></div></div></>}
  </div>;
}
