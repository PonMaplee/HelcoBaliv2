<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\CoffeeCatalog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * ponytail: hardcoded seed data to avoid extra files.
     */
    public function run(): void
    {
        \App\Models\Product::truncate();
        foreach (CoffeeCatalog::storefront() as $p) {
            \App\Models\Product::create($p);
        }

        $this->seedDashboard();
    }

    /**
     * Seed awal untuk dashboard B2B: admin, katalog pusat, dan pengaturan.
     * Idempotent — aman dijalankan berulang.
     */
    private function seedDashboard(): void
    {
        if (! \App\Models\User::where('role', 'admin')->exists()) {
            \App\Models\User::create([
                'name' => 'Administrator',
                'email' => config('helco.admin_email'),
                'password' => config('helco.admin_password'),
                'storeId' => null,
                'role' => 'admin',
            ]);
        }

        foreach (CoffeeCatalog::dashboard() as $seed) {
            $existing = \App\Models\CatalogProduct::where('name', $seed['name'])->first();
            if ($existing) {
                $existing->fill([
                    'price' => $seed['price'],
                    'image' => $seed['image'],
                    'notes' => $seed['notes'],
                    'roast' => $seed['roast'],
                    'origin' => $seed['origin'],
                    'descId' => $seed['descId'],
                    'descEn' => $seed['descEn'],
                ])->save();
            } else {
                \App\Models\CatalogProduct::create($seed);
            }
        }

        if (! \App\Models\DashboardSetting::first()) {
            \App\Models\DashboardSetting::create(['minStock' => null, 'expiryDays' => 7]);
        }
    }
}
