<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Gerai mitra (B2B partner store). Status: Diajukan / Disetujui / Ditolak.
 */
class Store extends Model
{
    protected $collection = 'stores';

    protected $fillable = [
        'name',
        'location',
        'status',
        'ownerEmail',
    ];
}
