<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\DashboardController;

/**
 * [TAG: ROUTING_API]
 * Semua URL API backend didefinisikan di sini.
 * Prefix `/api/` sudah otomatis ditambahkan oleh Laravel.
 */

// Menampilkan produk (Home / Explore)
Route::get('/products', [ApiController::class, 'getProducts']);
// Menampilkan spesifik 1 produk (Product Detail)
Route::get('/products/{id}', [ApiController::class, 'getProductById']);

// Mengelola keranjang belanja (Cart)
Route::get('/cart', [ApiController::class, 'getCart']);
Route::post('/cart', [ApiController::class, 'addToCart']);
Route::put('/cart/{id}', [ApiController::class, 'updateCartItem']);
Route::delete('/cart', [ApiController::class, 'clearCart']);
Route::delete('/cart/{id}', [ApiController::class, 'removeFromCart']);

// ── Dashboard B2B (backend penuh per entity) ──
Route::prefix('dashboard')->group(function () {
    // Auth publik
    Route::post('/register', [DashboardController::class, 'register']);
    Route::post('/login', [DashboardController::class, 'login']);

    // Butuh token
    Route::middleware('api.token')->group(function () {
        Route::get('/me', [DashboardController::class, 'me']);

        // Katalog produk
        Route::get('/products', [DashboardController::class, 'products']);
        Route::post('/products', [DashboardController::class, 'storeProduct']);
        Route::post('/products/seed', [DashboardController::class, 'seedCatalog']);
        Route::put('/products/{id}', [DashboardController::class, 'updateProduct']);
        Route::delete('/products/{id}', [DashboardController::class, 'deleteProduct']);

        // Gerai
        Route::get('/stores', [DashboardController::class, 'stores']);
        Route::patch('/stores/{id}/approve', [DashboardController::class, 'approveStore']);
        Route::patch('/stores/{id}/reject', [DashboardController::class, 'rejectStore']);

        // Stok
        Route::get('/rows', [DashboardController::class, 'rows']);
        Route::post('/rows', [DashboardController::class, 'storeRow']);

        // Pesanan
        Route::get('/requests', [DashboardController::class, 'requests']);
        Route::post('/requests', [DashboardController::class, 'storeRequest']);
        Route::post('/requests/{id}/approve', [DashboardController::class, 'approveRequest']);
        Route::post('/requests/{id}/reject', [DashboardController::class, 'rejectRequest']);
        Route::post('/requests/{id}/ship', [DashboardController::class, 'shipRequest']);
        Route::post('/requests/{id}/receive', [DashboardController::class, 'receiveRequest']);

        // Produksi
        Route::get('/production', [DashboardController::class, 'production']);
        Route::post('/production', [DashboardController::class, 'storeProduction']);
        Route::patch('/production/{id}/ready', [DashboardController::class, 'markReady']);

        // Shift
        Route::get('/shifts', [DashboardController::class, 'shifts']);
        Route::post('/shifts', [DashboardController::class, 'storeShift']);
        Route::post('/shifts/{id}/revise', [DashboardController::class, 'reviseShift']);

        // Aktivitas & pengaturan
        Route::get('/activities', [DashboardController::class, 'activities']);
        Route::get('/settings', [DashboardController::class, 'settings']);
        Route::put('/settings', [DashboardController::class, 'updateSettings']);
    });
});
