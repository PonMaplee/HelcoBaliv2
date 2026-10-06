<?php

namespace Database\Seeders;

use App\Models\User;
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
        $products = [
            [
                '_id' => 1,
                'title' => 'LA KINTAMANI',
                'price' => 120000,
                'origin' => 'Kintamani',
                'notes' => 'Citrus, Floral, Bright Acidity',
                'processing' => 'Washed Process',
                'roast' => 'Light Roast',
                'roastValue' => '25%',
                'badgeType' => 'bestseller',
                'description' => 'A refreshing single origin from the highlands of Bali. The washed process highlights its bright citrus notes and delicate floral aroma, making it a perfect morning brew.',
                'gallery' => ['/product-kintamani.jpg', '/product-kintamani.jpg', '/product-kintamani.jpg'],
                'image' => '/product-kintamani.jpg'
            ],
            [
                '_id' => 2,
                'title' => 'LA PLAGA',
                'price' => 135000,
                'origin' => 'Plaga Highlands',
                'notes' => 'Dark Chocolate, Brown Sugar, Bold',
                'processing' => 'Anaerobic Natural',
                'roast' => 'Medium-Dark Roast',
                'roastValue' => '75%',
                'badgeType' => 'new',
                'description' => 'The signature house blend for the perfect daily brew. Through an extended anaerobic natural fermentation process, we\'ve unlocked unparalleled fruit clarity and profound depth. Expect an intensely syrupy body paired with vibrant dark berry notes and a lingering, luxurious chocolate finish.',
                'gallery' => ['/product-plaga.jpg', '/product-plaga.jpg', '/product-plaga.jpg'],
                'image' => '/product-plaga.jpg'
            ],
            [
                '_id' => 3,
                'title' => 'LA PUPUAN',
                'price' => 110000,
                'origin' => 'Pupuan',
                'notes' => 'Earthy, Nutty, Full Body',
                'processing' => 'Honey Process',
                'roast' => 'Medium Roast',
                'roastValue' => '50%',
                'badgeType' => null,
                'description' => 'A robust classic that stands up well to milk. Grown in the rich soils of Pupuan, this coffee offers a comforting, full-bodied experience with prominent earthy and nutty undertones.',
                'gallery' => ['/product-pupuan.jpg', '/product-pupuan.jpg', '/product-pupuan.jpg'],
                'image' => '/product-pupuan.jpg'
            ],
            [
                '_id' => 4,
                'title' => 'ARTISAN TUMBLER',
                'price' => 250000,
                'origin' => null,
                'notes' => 'Stainless Steel, Double Wall, Matte Black',
                'processing' => 'Merchandise',
                'roast' => 'Accessory',
                'roastValue' => '0%',
                'badgeType' => 'new',
                'description' => 'Premium stainless steel vacuum tumbler. Designed to keep your cold brew chilled for up to 12 hours or your hot coffee warm for 6 hours. Features a sleek matte black finish and a premium leather strap.',
                'gallery' => ['/product tumblr kopi.jpg', '/product tumblr kopi.jpg', '/product tumblr kopi.jpg'],
                'image' => '/product tumblr kopi.jpg'
            ],
            [
                '_id' => 5,
                'title' => 'CERAMIC CUP',
                'price' => 85000,
                'origin' => null,
                'notes' => 'Hand-crafted, Speckled Glaze, 200ml',
                'processing' => 'Merchandise',
                'roast' => 'Accessory',
                'roastValue' => '0%',
                'badgeType' => null,
                'description' => 'Hand-crafted ceramic mug perfect for enjoying your slow-dripped coffee. Each piece is unique with a beautiful speckled glaze and an earthy green interior.',
                'gallery' => ['/product cangkir kopi.jpg', '/product cangkir kopi.jpg', '/product cangkir kopi.jpg'],
                'image' => '/product cangkir kopi.jpg'
            ]
        ];

        \App\Models\Product::truncate();
        foreach ($products as $p) {
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
                'email' => 'admin@helcobali.id',
                'password' => 'admin123',
                'storeId' => null,
                'role' => 'admin',
            ]);
        }

        foreach (\App\Http\Controllers\DashboardController::CENTRAL_CATALOG as $seed) {
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
                \App\Models\CatalogProduct::create(array_merge(['_id' => (string) \Illuminate\Support\Str::uuid()], $seed));
            }
        }

        if (! \App\Models\DashboardSetting::find('global')) {
            \App\Models\DashboardSetting::create(['_id' => 'global', 'minStock' => null, 'expiryDays' => 7]);
        }
    }
}
