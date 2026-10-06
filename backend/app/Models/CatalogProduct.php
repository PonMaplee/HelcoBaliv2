<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Katalog pusat untuk dashboard B2B (Pesan Stok / POS / shift).
 * Terpisah dari Product storefront (public site) yang punya skema sendiri.
 */
class CatalogProduct extends Model
{
    protected $collection = 'catalog_products';

    protected $fillable = [
        'name',
        'price',
        'image',
        'notes',
        'roast',
        'origin',
        'descId',
        'descEn',
    ];
}
