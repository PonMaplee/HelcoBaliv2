<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Laporan tutup shift per gerai (terjual per produk + kas aktual).
 */
class ShiftReport extends Model
{
    protected $collection = 'shift_reports';

    protected $fillable = [
        'storeId',
        'date',
        'lines',
        'expectedTotal',
        'actualTotal',
        'difference',
        'note',
        'editedAt',
        'editCount',
    ];
}
