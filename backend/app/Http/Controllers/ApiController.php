<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\ApiQuery;
use Illuminate\Http\Request;

/**
 * [TAG: API_CONTROLLER]
 * REST API produk publik (Home / Explore).
 */
class ApiController extends Controller
{
    /**
     * [TAG: GET_PRODUCTS]
     * Daftar produk. Mendukung page, per_page, q, sort, dan order.
     */
    public function getProducts(Request $request)
    {
        $query = Product::query();
        ApiQuery::whereText($query, $request, ['title', 'origin', 'notes', 'roast']);
        ApiQuery::applySort($query, $request, ['title', 'price', 'origin', 'roast'], 'title', 'asc');

        return ApiQuery::paginate($query, $request);
    }

    /**
     * [TAG: GET_PRODUCT_BY_ID]
     * Detail satu produk. 404 bila id tidak ada.
     */
    public function getProductById($id)
    {
        $product = Product::where('_id', (int) $id)->first();

        if (! $product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json($product);
    }
}
