<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Pengaturan global dashboard (stok minimum, peringatan kedaluwarsa).
 * Satu dokumen dengan _id tetap 'global'.
 */
class DashboardSetting extends Model
{
    protected $collection = 'settings';

    protected $fillable = [
        'minStock',
        'expiryDays',
    ];
}
