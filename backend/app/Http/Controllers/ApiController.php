<?php

namespace App\Http\Controllers;

use App\Models\Product;

/**
 * [TAG: API_CONTROLLER]
 * Controller utama yang menangani REST API produk publik.
 * Didesain tanpa banyak pemisahan file untuk menjaga keringkasan kode (Clean Code).
 */
class ApiController extends Controller
{
    /**
     * [TAG: GET_PRODUCTS]
     * Mengambil seluruh daftar produk dari database MongoDB.
     * Fungsi ini digunakan untuk menampilkan carousel di halaman Home dan daftar produk di halaman Explore.
     */
    public function getProducts()
    {
        return response()->json(Product::all());
    }

    /**
     * [TAG: GET_PRODUCT_BY_ID]
     * Mengambil detail spesifik dari satu produk berdasarkan ID integer-nya.
     * Fungsi ini merender informasi produk pada halaman Product Detail.
     */
    public function getProductById($id)
    {
        $product = Product::where('_id', (int) $id)->first();

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json($product);
    }
}
