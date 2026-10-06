<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Satu baris stok fisik per gerai per produk per batch (FEFO).
 */
class StockRow extends Model
{
    protected $collection = 'stock_rows';

    protected $fillable = [
        'batch',
        'storeId',
        'productId',
        'opening',
        'received',
        'sold',
        'damaged',
        'returned',
        'physical',
        'expires',
        'created',
    ];
}
