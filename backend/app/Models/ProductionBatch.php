<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Batch produksi (diseduh pusat). status: Diseduh / Siap kirim.
 */
class ProductionBatch extends Model
{
    protected $collection = 'production_batches';

    protected $fillable = [
        'batch',
        'requestId',
        'storeId',
        'productId',
        'quantity',
        'available',
        'expires',
        'created',
        'status',
    ];
}
