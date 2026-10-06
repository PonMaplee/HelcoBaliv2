<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\CatalogProduct;
use App\Models\DashboardSetting;
use App\Models\ProductionBatch;
use App\Models\RestockRequest;
use App\Models\ShiftReport;
use App\Models\StockRow;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Backend penuh untuk dashboard kemitraan (B2B).
 * Logika bisnis (FEFO, approve→produksi, kirim, terima, shift, ralat)
 * dipindah dari dashboardModel.js ke sini. Auth token bearer sederhana.
 */
class DashboardController extends Controller
{
    const STORE_STATUS = ['Diajukan', 'Disetujui', 'Ditolak'];

    // Katalog pusat (3 kopi) — cermin CENTRAL_CATALOG di dashboardModel.js.
    const CENTRAL_CATALOG = [
        ['name' => 'LA KINTAMANI', 'price' => 120000, 'image' => '/product-kintamani.jpg', 'notes' => 'Citrus, Floral, Bright Acidity', 'roast' => 'Light Roast', 'origin' => 'Kintamani', 'descId' => 'Single origin dari dataran tinggi Kintamani. Proses washed menonjolkan citrus cerah dan aroma floral — seduhan pagi yang menyegarkan.', 'descEn' => 'Single origin from the Kintamani highlands. The washed process highlights bright citrus and delicate floral aroma — a refreshing morning brew.'],
        ['name' => 'LA PLAGA', 'price' => 135000, 'image' => '/product-plaga.jpg', 'notes' => 'Dark Chocolate, Brown Sugar, Bold', 'roast' => 'Medium-Dark Roast', 'origin' => 'Plaga Highlands', 'descId' => 'Signature house blend untuk seduhan harian. Fermentasi anaerobic natural memberi body syrupy, buah beri gelap, dan finish cokelat mewah.', 'descEn' => 'The signature house blend for the perfect daily brew. Anaerobic natural fermentation brings syrupy body, dark berries, and a luxurious chocolate finish.'],
        ['name' => 'LA PUPUAN', 'price' => 110000, 'image' => '/product-pupuan.jpg', 'notes' => 'Earthy, Nutty, Full Body', 'roast' => 'Medium Roast', 'origin' => 'Pupuan', 'descId' => 'Klasik robust dari tanah subur Pupuan. Full-bodied dengan earthy dan nutty yang menenangkan — cocok dipadukan susu.', 'descEn' => 'A robust classic from the rich soils of Pupuan. Full-bodied with comforting earthy and nutty undertones — stands up well to milk.'],
    ];

    // ───────────────────────── Auth ─────────────────────────

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:120',
            'password' => 'required|string|min:6|max:100',
            'storeName' => 'required|string|max:100',
            'location' => 'required|string|max:120',
        ]);

        $email = strtolower(trim($data['email']));
        if (User::where('email', $email)->exists()) {
            return response()->json(['message' => 'Email sudah terdaftar. Silakan masuk.'], 422);
        }
        if (Store::where('name', 'regex', '/^'.preg_quote(trim($data['storeName']), '/').'$/i')->exists()) {
            return response()->json(['message' => 'Nama gerai sudah terdaftar.'], 422);
        }

        $storeId = (string) Str::uuid();
        $store = Store::create([
            '_id' => $storeId,
            'name' => trim($data['storeName']),
            'location' => trim($data['location']),
            'status' => 'Diajukan',
            'ownerEmail' => $email,
        ]);

        $user = User::create([
            'name' => trim($data['name']),
            'email' => $email,
            'password' => $data['password'],
            'storeId' => $storeId,
            'role' => 'staff',
            'api_token' => Str::random(60),
        ]);

        return response()->json(['user' => $user, 'store' => $store, 'token' => $user->api_token], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email atau kata sandi salah.'], 422);
        }

        $user->api_token = Str::random(60);
        $user->save();

        return response()->json(['user' => $user, 'token' => $user->api_token]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $store = $user->storeId ? Store::find($user->storeId) : null;

        return response()->json(['user' => $user, 'store' => $store]);
    }

    // ───────────────────────── Katalog produk ─────────────────────────

    public function products(Request $request)
    {
        $this->ensureSeeded();

        return response()->json(CatalogProduct::orderBy('name')->get());
    }

    public function storeProduct(Request $request)
    {
        $this->adminOnly($request);
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|integer|min:1',
            'image' => 'nullable|string|max:200',
            'notes' => 'nullable|string|max:160',
            'roast' => 'nullable|string|max:100',
            'origin' => 'nullable|string|max:100',
            'descId' => 'nullable|string|max:500',
            'descEn' => 'nullable|string|max:500',
        ]);

        $name = trim($data['name']);
        if (CatalogProduct::where('name', 'regex', '/^'.preg_quote($name, '/').'$/i')->exists()) {
            return response()->json(['message' => 'Produk tersebut sudah dicatat.'], 422);
        }

        $product = CatalogProduct::create(array_merge(['_id' => (string) Str::uuid()], $data, ['name' => $name]));

        return response()->json(['products' => CatalogProduct::orderBy('name')->get()], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $this->adminOnly($request);
        $product = CatalogProduct::find($id);
        if (! $product) {
            return response()->json(['message' => 'Produk tidak ditemukan.'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|integer|min:1',
            'image' => 'nullable|string|max:200',
            'notes' => 'nullable|string|max:160',
            'roast' => 'nullable|string|max:100',
            'origin' => 'nullable|string|max:100',
            'descId' => 'nullable|string|max:500',
            'descEn' => 'nullable|string|max:500',
        ]);

        $name = trim($data['name']);
        $clash = CatalogProduct::where('name', 'regex', '/^'.preg_quote($name, '/').'$/i')
            ->where('_id', '!=', $id)->exists();
        if ($clash) {
            return response()->json(['message' => 'Produk tersebut sudah dicatat.'], 422);
        }

        $product->fill(array_merge($data, ['name' => $name]))->save();

        return response()->json(['products' => CatalogProduct::orderBy('name')->get()]);
    }

    public function deleteProduct(Request $request, $id)
    {
        $this->adminOnly($request);
        $inUse = StockRow::where('productId', $id)->exists()
            || RestockRequest::where('productId', $id)->exists()
            || ProductionBatch::where('productId', $id)->exists();
        if ($inUse) {
            return response()->json(['message' => 'Produk sedang dipakai dan tidak bisa dihapus.'], 422);
        }
        CatalogProduct::find($id)?->delete();

        return response()->json(['products' => CatalogProduct::orderBy('name')->get()]);
    }

    public function seedCatalog(Request $request)
    {
        $this->adminOnly($request);
        $this->seedCentralCatalog();

        return response()->json(['products' => CatalogProduct::orderBy('name')->get()]);
    }

    // ───────────────────────── Gerai ─────────────────────────

    public function stores(Request $request)
    {
        $user = $request->user();
        $query = Store::query();
        if ($user->role !== 'admin') {
            $query->where('_id', $user->storeId);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function approveStore(Request $request, $id)
    {
        $this->adminOnly($request);
        Store::where('_id', $id)->update(['status' => 'Disetujui']);

        return response()->json(['stores' => Store::orderBy('name')->get()]);
    }

    public function rejectStore(Request $request, $id)
    {
        $this->adminOnly($request);
        Store::where('_id', $id)->update(['status' => 'Ditolak']);

        return response()->json(['stores' => Store::orderBy('name')->get()]);
    }

    // ───────────────────────── Stok ─────────────────────────

    public function rows(Request $request)
    {
        $query = StockRow::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return response()->json($query->get());
    }

    public function storeRow(Request $request)
    {
        $this->adminOnly($request);
        $data = $request->validate([
            'storeId' => 'required|string',
            'productId' => 'required|string',
            'batch' => 'required|string|max:80',
            'quantity' => 'required|integer|min:1|max:10000',
            'expires' => 'required|date',
        ]);

        if (StockRow::where('batch', $data['batch'])->where('storeId', $data['storeId'])->exists()) {
            return response()->json(['message' => 'Batch sudah tercatat pada gerai ini.'], 422);
        }

        StockRow::create([
            '_id' => (string) Str::uuid(),
            'batch' => $data['batch'],
            'storeId' => $data['storeId'],
            'productId' => $data['productId'],
            'opening' => $data['quantity'],
            'received' => 0,
            'sold' => 0,
            'damaged' => 0,
            'returned' => 0,
            'physical' => $data['quantity'],
            'expires' => $data['expires'],
            'created' => $this->todayISO(),
        ]);

        return response()->json(['rows' => $this->scopedRows($request)]);
    }

    // ───────────────────────── Pesanan (restok / POS) ─────────────────────────

    public function requests(Request $request)
    {
        $query = RestockRequest::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return response()->json($query->get());
    }

    public function storeRequest(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'customer' => 'nullable|string|max:100',
            'method' => 'required|string',
            'discount' => 'nullable|integer|min:0',
            'tax' => 'nullable|integer|min:0',
            'total' => 'required|integer|min:1',
            'lines' => 'required|array|min:1',
            'lines.*.productId' => 'required|string',
            'lines.*.qty' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
        ]);

        $storeId = $user->storeId;
        $receiptId = 'ORD-'.str_replace('-', '', $this->todayISO()).'-'.str_pad((string) (RestockRequest::count() + 1), 3, '0', STR_PAD_LEFT);

        $lines = array_map(fn ($l) => [
            'productId' => $l['productId'],
            'qty' => (int) $l['qty'],
            'price' => (int) $l['price'],
        ], $data['lines']);

        $order = RestockRequest::create([
            '_id' => (string) Str::uuid(),
            'storeId' => $storeId,
            'productId' => $lines[0]['productId'],
            'quantity' => array_sum(array_column($lines, 'qty')),
            'price' => $lines[0]['price'],
            'status' => 'Diajukan',
            'source' => 'pos',
            'lines' => $lines,
            'subtotal' => array_sum(array_map(fn ($l) => $l['price'] * $l['qty'], $lines)),
            'discount' => (int) ($data['discount'] ?? 0),
            'tax' => (int) ($data['tax'] ?? 0),
            'total' => (int) $data['total'],
            'method' => $data['method'],
            'customer' => trim($data['customer'] ?? '') ?: 'Walk-in',
            'receiptId' => $receiptId,
            'created' => $this->todayISO(),
            'note' => 'Order '.$receiptId.' · '.($data['customer'] ?? 'Walk-in').' · '.$data['method'],
            'allocations' => [],
            'received' => [],
        ]);

        return response()->json(['requests' => $this->scopedRequests($request)], 201);
    }

    public function rejectRequest(Request $request, $id)
    {
        $this->adminOnly($request);
        RestockRequest::where('_id', $id)->update(['status' => 'Ditolak']);

        return response()->json(['requests' => $this->scopedRequests($request)]);
    }

    public function approveRequest(Request $request, $id)
    {
        $this->adminOnly($request);
        $data = $request->validate(['expires' => 'required|date']);

        $req = RestockRequest::find($id);
        if (! $req || $req->status !== 'Diajukan') {
            return response()->json(['message' => 'Permintaan tidak valid.'], 422);
        }
        if ($this->daysUntil($data['expires']) < 0) {
            return response()->json(['message' => 'Tanggal kedaluwarsa batch belum valid.'], 422);
        }

        $lines = $this->normalizeLines($req);
        $date = $this->todayISO();
        foreach ($lines as $i => $line) {
            ProductionBatch::create([
                '_id' => (string) Str::uuid(),
                'batch' => 'B-'.strtoupper(substr($req->id, 0, 6)).'-'.($i + 1),
                'requestId' => $req->id,
                'storeId' => $req->storeId,
                'productId' => $line['productId'],
                'quantity' => $line['qty'],
                'available' => $line['qty'],
                'expires' => $data['expires'],
                'created' => $date,
                'status' => 'Diseduh',
            ]);
        }
        $req->status = 'Produksi';
        $req->save();

        return response()->json([
            'requests' => $this->scopedRequests($request),
            'production' => $this->scopedProduction($request),
        ]);
    }

    public function shipRequest(Request $request, $id)
    {
        $this->adminOnly($request);
        $req = RestockRequest::find($id);
        if (! $req || $req->status !== 'Produksi') {
            return response()->json(['message' => 'Permintaan belum siap dikirim.'], 422);
        }

        $lines = $this->normalizeLines($req);
        $pool = ProductionBatch::where('status', 'Siap kirim')
            ->where('available', '>', 0)
            ->get()->toArray();
        $pool = array_values(array_filter($pool, fn ($b) =>
            ($b['requestId'] ?? null) === null || $b['requestId'] === $req->id
        ));

        $createdByBatch = [];
        foreach ($pool as $b) {
            $createdByBatch[$b['id']] = $b['created'] ?? $req->created ?? $this->todayISO();
        }

        $flat = [];
        foreach ($lines as $line) {
            $alloc = $this->allocateFEFO($pool, $line['productId'], $line['qty']);
            if ($alloc === null) {
                return response()->json(['message' => 'Produksi belum cukup untuk dikirim.'], 422);
            }
            foreach ($alloc as $a) {
                $flat[] = $a + [
                    'productId' => $line['productId'],
                    'created' => $createdByBatch[$a['batchId']] ?? $req->created ?? $this->todayISO(),
                ];
            }
        }

        // Kurangi available per batch.
        foreach ($flat as $a) {
            ProductionBatch::where('_id', $a['batchId'])->decrement('available', $a['quantity']);
        }

        $req->status = 'Dikirim';
        $req->allocations = $flat;
        $req->save();

        return response()->json([
            'requests' => $this->scopedRequests($request),
            'production' => $this->scopedProduction($request),
        ]);
    }

    public function receiveRequest(Request $request, $id)
    {
        $user = $request->user();
        $req = RestockRequest::find($id);
        if (! $req || $req->storeId !== $user->storeId || $req->status !== 'Dikirim') {
            return response()->json(['message' => 'Kiriman tidak valid.'], 422);
        }

        $breakdown = $request->validate(['lines' => 'required|array'])['lines'];
        $shipped = $this->shippedLines($req);
        $error = $this->validateReceiptLines($shipped, $breakdown);
        if ($error) {
            return response()->json(['message' => $error], 422);
        }

        $date = $this->todayISO();
        $batchById = [];
        foreach (ProductionBatch::all()->toArray() as $b) {
            $batchById[$b['id']] = $b;
        }

        foreach ($shipped as $line) {
            $input = collect($breakdown)->firstWhere('productId', $line['productId']);
            $good = (int) ($input['good'] ?? 0);
            $retur = (int) ($input['retur'] ?? 0);
            $allocs = array_values(array_filter($req->allocations ?? [], fn ($a) => ($a['productId'] ?? '') === $line['productId']));

            if ($good > 0) {
                if ($allocs) {
                    $remaining = $good;
                    foreach ($allocs as $alloc) {
                        if ($remaining <= 0) {
                            break;
                        }
                        $portion = min($alloc['quantity'], $remaining);
                        if (! $portion) {
                            continue;
                        }
                        $remaining -= $portion;
                        $prod = isset($alloc['batchId']) ? ($batchById[$alloc['batchId']] ?? null) : null;
                        $expires = $alloc['expires'] ?? $prod['expires'] ?? $date;
                        $created = $alloc['created'] ?? $prod['created'] ?? $req->created ?? $date;
                        $batchName = $alloc['batch'] ?? 'B-'.strtoupper(substr($req->id, 0, 6));
                        $this->addStock($req->storeId, $line['productId'], $batchName, $portion, $expires, $created, $date);
                    }
                } else {
                    $batchName = 'B-'.strtoupper(substr($req->id, 0, 6));
                    $this->addStock($req->storeId, $line['productId'], $batchName, $good, $date, $req->created ?? $date, $date);
                }
            }
            if ($retur > 0) {
                Activity::create([
                    '_id' => (string) Str::uuid(),
                    'rowId' => 'pos',
                    'storeId' => $req->storeId,
                    'productId' => $line['productId'],
                    'batch' => 'B-'.strtoupper(substr($req->id, 0, 6)),
                    'kind' => 'retur',
                    'quantity' => $retur,
                    'date' => $date,
                    'note' => 'Retur penerimaan '.($req->receiptId ?? substr($req->id, 0, 8)),
                ]);
            }
        }

        $req->status = 'Diterima';
        $req->received = $breakdown;
        $req->save();

        return response()->json([
            'requests' => $this->scopedRequests($request),
            'rows' => $this->scopedRows($request),
            'activities' => $this->scopedActivities($request),
        ]);
    }

    // ───────────────────────── Produksi ─────────────────────────

    public function production(Request $request)
    {
        return response()->json($this->scopedProduction($request));
    }

    public function storeProduction(Request $request)
    {
        $this->adminOnly($request);
        $data = $request->validate([
            'productId' => 'required|string',
            'batch' => 'required|string|max:80',
            'quantity' => 'required|integer|min:1|max:10000',
            'expires' => 'required|date',
        ]);

        if (ProductionBatch::where('batch', $data['batch'])->exists()) {
            return response()->json(['message' => 'Nomor batch produksi sudah tercatat.'], 422);
        }

        ProductionBatch::create([
            '_id' => (string) Str::uuid(),
            'batch' => $data['batch'],
            'requestId' => null,
            'storeId' => null,
            'productId' => $data['productId'],
            'quantity' => $data['quantity'],
            'available' => $data['quantity'],
            'expires' => $data['expires'],
            'created' => $this->todayISO(),
            'status' => 'Diseduh',
        ]);

        return response()->json(['production' => $this->scopedProduction($request)]);
    }

    public function markReady(Request $request, $id)
    {
        $this->adminOnly($request);
        ProductionBatch::where('_id', $id)->update(['status' => 'Siap kirim']);

        return response()->json(['production' => $this->scopedProduction($request)]);
    }

    // ───────────────────────── Shift ─────────────────────────

    public function shifts(Request $request)
    {
        $query = ShiftReport::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return response()->json($query->get());
    }

    public function storeShift(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'lines' => 'required|array|min:1',
            'lines.*.productId' => 'required|string',
            'lines.*.qty' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
            'actualTotal' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:200',
        ]);

        $storeId = $user->storeId;
        $lines = $this->cleanLines($data['lines']);
        $this->assertShiftStock($storeId, $lines);

        $expected = $this->expectedTotal($lines);
        $actual = (int) ($data['actualTotal'] ?? 0);
        $reportId = (string) Str::uuid();

        foreach ($lines as $line) {
            $this->deductStock($storeId, $line, $reportId, $data['note'] ?? '', $this->todayISO());
        }

        $report = ShiftReport::create([
            '_id' => $reportId,
            'storeId' => $storeId,
            'date' => $this->todayISO(),
            'lines' => $this->reportLines($lines),
            'expectedTotal' => $expected,
            'actualTotal' => $actual,
            'difference' => $actual - $expected,
            'note' => trim($data['note'] ?? ''),
            'editedAt' => null,
            'editCount' => 0,
        ]);

        return response()->json([
            'shiftReports' => $this->scopedShifts($request),
            'rows' => $this->scopedRows($request),
            'activities' => $this->scopedActivities($request),
        ]);
    }

    public function reviseShift(Request $request, $id)
    {
        $user = $request->user();
        $report = ShiftReport::find($id);
        if (! $report || $report->storeId !== $user->storeId) {
            return response()->json(['message' => 'Laporan ini milik gerai lain atau tidak ditemukan.'], 422);
        }

        $data = $request->validate([
            'lines' => 'required|array|min:1',
            'lines.*.productId' => 'required|string',
            'lines.*.qty' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
            'actualTotal' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:200',
        ]);

        $storeId = $user->storeId;
        $lines = $this->cleanLines($data['lines']);
        $oldByProduct = [];
        foreach ($report->lines ?? [] as $l) {
            $oldByProduct[$l['productId']] = (int) $l['qty'];
        }
        foreach ($lines as $line) {
            $oldQty = $oldByProduct[$line['productId']] ?? 0;
            $available = $this->realStockFor($storeId, $line['productId']) + $oldQty;
            if ($line['qty'] > $available) {
                return response()->json(['message' => 'Jumlah terjual melebihi stok gerai.'], 422);
            }
        }

        // 1. Rollback: kembalikan stok lama + hapus aktivitas terjual laporan ini.
        $this->rollbackShift($report, $storeId);

        // 2. Terapkan angka baru.
        foreach ($lines as $line) {
            $this->deductStock($storeId, $line, $report->id, $data['note'] ?? '', $report->date);
        }

        $summary = implode(', ', array_map(fn ($l) => $l['productId'].' '.($oldByProduct[$l['productId']] ?? 0).'→'.$l['qty'], $lines));
        Activity::create([
            '_id' => (string) Str::uuid(),
            'reportId' => $report->id,
            'rowId' => 'pos',
            'storeId' => $storeId,
            'productId' => $lines[0]['productId'] ?? null,
            'batch' => '-',
            'kind' => 'koreksi',
            'quantity' => 0,
            'date' => $report->date,
            'note' => 'Ralat shift '.$report->date.': '.$summary,
        ]);

        $expected = $this->expectedTotal($lines);
        $actual = (int) ($data['actualTotal'] ?? 0);
        $report->lines = $this->reportLines($lines);
        $report->expectedTotal = $expected;
        $report->actualTotal = $actual;
        $report->difference = $actual - $expected;
        $report->note = trim($data['note'] ?? '');
        $report->editedAt = now()->toISOString();
        $report->editCount = ($report->editCount ?? 0) + 1;
        $report->save();

        return response()->json([
            'shiftReports' => $this->scopedShifts($request),
            'rows' => $this->scopedRows($request),
            'activities' => $this->scopedActivities($request),
        ]);
    }

    // ───────────────────────── Aktivitas & pengaturan ─────────────────────────

    public function activities(Request $request)
    {
        return response()->json($this->scopedActivities($request));
    }

    public function settings(Request $request)
    {
        return response()->json($this->getSettings());
    }

    public function updateSettings(Request $request)
    {
        $this->adminOnly($request);
        $data = $request->validate([
            'minStock' => 'required|integer|min:1|max:10000',
            'expiryDays' => 'required|integer|min:1|max:30',
        ]);
        $this->saveSettings($data);

        return response()->json(['settings' => $data]);
    }

    // ───────────────────────── Helper ─────────────────────────

    private function adminOnly(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Admin only');
        }
    }

    private function todayISO($now = null): string
    {
        $d = $now ?: new \DateTimeImmutable();

        return $d->format('Y-m-d');
    }

    private function daysUntil(string $date, $now = null): int
    {
        return (int) round((strtotime($date.' 12:00:00') - strtotime($this->todayISO($now).' 12:00:00')) / 86400);
    }

    private function normalizeLines(RestockRequest $req): array
    {
        $lines = $req->lines ?? [];
        if ((! $lines || count($lines) === 0) && $req->productId) {
            return [['productId' => $req->productId, 'qty' => (int) $req->quantity, 'price' => (int) ($req->price ?? 0)]];
        }

        return array_map(fn ($l) => [
            'productId' => $l['productId'],
            'qty' => (int) $l['qty'],
            'price' => (int) ($l['price'] ?? 0),
        ], $lines);
    }

    private function cleanLines(array $lines): array
    {
        return array_values(array_filter(array_map(fn ($l) => [
            'productId' => $l['productId'],
            'qty' => (int) $l['qty'],
            'price' => (int) $l['price'],
        ], $lines), fn ($l) => $l['qty'] > 0));
    }

    private function expectedTotal(array $lines): int
    {
        return array_sum(array_map(fn ($l) => $l['price'] * $l['qty'], $lines));
    }

    private function reportLines(array $lines): array
    {
        return array_map(fn ($l) => [
            'productId' => $l['productId'],
            'qty' => $l['qty'],
            'price' => $l['price'],
            'subtotal' => $l['price'] * $l['qty'],
        ], $lines);
    }

    private function allocateFEFO(array $batches, string $productId, int $quantity): ?array
    {
        $candidates = array_filter($batches, fn ($b) =>
            ($b['productId'] ?? '') === $productId
            && ($b['status'] ?? '') === 'Siap kirim'
            && ($b['available'] ?? 0) > 0
            && $this->daysUntil($b['expires'] ?? '') >= 0
        );
        usort($candidates, fn ($a, $b) => strcmp($a['expires'], $b['expires']));

        $remaining = $quantity;
        $alloc = [];
        foreach ($candidates as $batch) {
            $qty = min((int) $batch['available'], $remaining);
            $remaining -= $qty;
            if ($qty) {
                $alloc[] = [
                    'batchId' => $batch['id'],
                    'batch' => $batch['batch'],
                    'quantity' => $qty,
                    'expires' => $batch['expires'],
                ];
            }
            if ($remaining <= 0) {
                break;
            }
        }

        return $remaining === 0 ? $alloc : null;
    }

    private function shippedLines(RestockRequest $req): array
    {
        $allocs = $req->allocations ?? [];
        if (count($allocs)) {
            $byProduct = [];
            foreach ($allocs as $a) {
                $pid = $a['productId'];
                $byProduct[$pid] = ($byProduct[$pid] ?? 0) + (int) $a['quantity'];
            }
            $out = [];
            foreach ($byProduct as $pid => $qty) {
                $out[] = ['productId' => $pid, 'qty' => $qty];
            }

            return $out;
        }

        return $this->normalizeLines($req);
    }

    private function validateReceiptLines(array $shipped, array $input): ?string
    {
        foreach ($shipped as $line) {
            $found = collect($input)->firstWhere('productId', $line['productId']);
            $good = (int) ($found['good'] ?? 0);
            $retur = (int) ($found['retur'] ?? 0);
            if ($good < 0 || $retur < 0) {
                return 'Jumlah siap jual dan retur harus bilangan bulat ≥ 0.';
            }
            if ($good + $retur !== (int) $line['qty']) {
                return 'Jumlah siap jual + retur harus sama dengan jumlah terkirim.';
            }
        }

        return null;
    }

    private function addStock(string $storeId, string $productId, string $batchName, int $qty, string $expires, string $created, string $date): void
    {
        $existing = StockRow::where('storeId', $storeId)
            ->where('productId', $productId)
            ->where('batch', $batchName)
            ->first();
        if ($existing) {
            $existing->physical = (int) $existing->physical + $qty;
            $existing->received = (int) $existing->received + $qty;
            if ($existing->expires !== $expires) {
                $existing->expires = $expires;
            }
            $existing->save();

            return;
        }
        StockRow::create([
            '_id' => (string) Str::uuid(),
            'batch' => $batchName,
            'storeId' => $storeId,
            'productId' => $productId,
            'opening' => 0,
            'received' => $qty,
            'sold' => 0,
            'damaged' => 0,
            'returned' => 0,
            'physical' => $qty,
            'expires' => $expires,
            'created' => $created,
        ]);
    }

    private function realStockFor(string $storeId, string $productId): int
    {
        return (int) StockRow::where('storeId', $storeId)->where('productId', $productId)->sum('physical');
    }

    private function assertShiftStock(string $storeId, array $lines): void
    {
        foreach ($lines as $line) {
            $stock = $this->realStockFor($storeId, $line['productId']);
            if ($line['qty'] > $stock) {
                abort(422, 'Jumlah terjual melebihi stok gerai.');
            }
        }
    }

    private function deductStock(string $storeId, array $line, string $reportId, string $note, string $date): void
    {
        $remaining = $line['qty'];
        $targets = StockRow::where('storeId', $storeId)
            ->where('productId', $line['productId'])
            ->where('physical', '>', 0)
            ->get()
            ->sortBy('expires');
        foreach ($targets as $row) {
            if ($remaining <= 0) {
                break;
            }
            $taken = min((int) $row->physical, $remaining);
            $row->physical = (int) $row->physical - $taken;
            $row->sold = (int) $row->sold + $taken;
            $row->save();
            $remaining -= $taken;

            Activity::create([
                '_id' => (string) Str::uuid(),
                'reportId' => $reportId,
                'rowId' => $row->id,
                'storeId' => $storeId,
                'productId' => $line['productId'],
                'batch' => $row->batch,
                'kind' => 'terjual',
                'quantity' => $taken,
                'date' => $date,
                'note' => $note ?: 'Tutup shift',
            ]);
        }
    }

    private function rollbackShift(ShiftReport $report, string $storeId): void
    {
        $oldActivities = Activity::where('reportId', $report->id)->where('kind', 'terjual')->get();
        if ($oldActivities->isNotEmpty()) {
            foreach ($oldActivities as $act) {
                $row = StockRow::find($act->rowId);
                if ($row) {
                    $back = min((int) $act->quantity, (int) $row->sold);
                    $row->physical = (int) $row->physical + $back;
                    $row->sold = (int) $row->sold - $back;
                    $row->save();
                }
                $act->delete();
            }

            return;
        }
        // Data lama tanpa reportId: kembalikan per produk dari batch sold>0 terdekat.
        $oldByProduct = [];
        foreach ($report->lines ?? [] as $l) {
            $oldByProduct[$l['productId']] = ($oldByProduct[$l['productId']] ?? 0) + (int) $l['qty'];
        }
        foreach ($oldByProduct as $productId => $qty) {
            $remaining = $qty;
            $targets = StockRow::where('storeId', $storeId)
                ->where('productId', $productId)
                ->where('sold', '>', 0)
                ->get()
                ->sortBy('expires');
            foreach ($targets as $row) {
                if ($remaining <= 0) {
                    break;
                }
                $back = min((int) $row->sold, $remaining);
                $row->physical = (int) $row->physical + $back;
                $row->sold = (int) $row->sold - $back;
                $row->save();
                $remaining -= $back;
            }
        }
    }

    // ── Scoped list untuk respons patch (admin: semua; staff: miliknya) ──

    private function scopedRows(Request $request)
    {
        $query = StockRow::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return $query->get();
    }

    private function scopedRequests(Request $request)
    {
        $query = RestockRequest::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return $query->get();
    }

    private function scopedProduction(Request $request)
    {
        // Halaman produksi khusus admin; staff tidak menerima batch produksi.
        if ($request->user()->role !== 'admin') {
            return collect();
        }

        return ProductionBatch::get();
    }

    private function scopedActivities(Request $request)
    {
        $query = Activity::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return $query->get();
    }

    private function scopedShifts(Request $request)
    {
        $query = ShiftReport::query();
        if ($request->user()->role !== 'admin') {
            $query->where('storeId', $request->user()->storeId);
        }

        return $query->get();
    }

    // ── Seeding idempotent (admin + katalog + settings) ──

    private function ensureSeeded(): void
    {
        if (! User::where('role', 'admin')->exists()) {
            User::create([
                'name' => 'Administrator',
                'email' => 'admin@helcobali.id',
                'password' => 'admin123',
                'storeId' => null,
                'role' => 'admin',
            ]);
        }
        $this->seedCentralCatalog();
        if (! DashboardSetting::find('global')) {
            DashboardSetting::create(['_id' => 'global', 'minStock' => null, 'expiryDays' => 7]);
        }
    }

    private function seedCentralCatalog(): void
    {
        foreach (self::CENTRAL_CATALOG as $seed) {
            $existing = CatalogProduct::where('name', $seed['name'])->first();
            if ($existing) {
                $existing->fill([
                    'price' => $seed['price'],
                    'image' => $seed['image'],
                    'notes' => $seed['notes'],
                    'roast' => $seed['roast'],
                    'origin' => $seed['origin'],
                    'descId' => $seed['descId'],
                    'descEn' => $seed['descEn'],
                ])->save();
            } else {
                CatalogProduct::create(array_merge(['_id' => (string) Str::uuid()], $seed));
            }
        }
    }

    private function getSettings(): array
    {
        $s = DashboardSetting::find('global');

        return $s ? ['minStock' => $s->minStock, 'expiryDays' => $s->expiryDays] : ['minStock' => null, 'expiryDays' => 7];
    }

    private function saveSettings(array $data): void
    {
        $s = DashboardSetting::find('global');
        if ($s) {
            $s->fill($data)->save();
        } else {
            DashboardSetting::create(array_merge(['_id' => 'global'], $data));
        }
    }
}
