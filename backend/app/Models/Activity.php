<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Jejak aktivitas stok (terjual, retur, koreksi) untuk laporan.
 */
class Activity extends Model
{
    protected $collection = 'activities';

    protected $fillable = [
        'reportId',
        'rowId',
        'storeId',
        'productId',
        'batch',
        'kind',
        'quantity',
        'date',
        'note',
    ];
}
