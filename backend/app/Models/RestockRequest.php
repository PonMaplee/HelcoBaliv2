<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Pesanan restok dari gerai (POS / Pesan Stok). Berisi lines + status alur.
 */
class RestockRequest extends Model
{
    protected $collection = 'restock_requests';

    protected $fillable = [
        'storeId',
        'productId',
        'quantity',
        'price',
        'status',
        'source',
        'lines',
        'subtotal',
        'discount',
        'tax',
        'total',
        'method',
        'customer',
        'receiptId',
        'created',
        'note',
        'allocations',
        'received',
    ];
}
