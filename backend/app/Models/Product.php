<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * [TAG: MODEL_PRODUCT]
 * Merepresentasikan skema (tabel) data Produk di database MongoDB.
 * Berisi informasi seperti judul, harga, rasa (notes), dsb.
 */
class Product extends Model
{
    /**
     * @var string Collection name in MongoDB
     */
    protected $collection = 'products';

    /**
     * [TAG: CONFIG_FILLABLE_PRODUCT]
     * Menentukan kolom mana saja yang diizinkan untuk diisi secara massal (mass assignment).
     */
    protected $fillable = [
        'title',
        'price',
        'notes',
        'processing',
        'roast',
        'roastValue',
        'badgeType',
        'origin',
        'description',
        'gallery',
        'image'
    ];
}
