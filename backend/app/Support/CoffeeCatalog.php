<?php

namespace App\Support;

/**
 * Satu daftar kopi untuk katalog dashboard dan produk toko.
 * Merchandise hanya ada di toko.
 */
class CoffeeCatalog
{
    public static function dashboard(): array
    {
        return array_map(fn (array $coffee) => [
            'name' => $coffee['name'],
            'price' => $coffee['price'],
            'image' => $coffee['image'],
            'notes' => $coffee['notes'],
            'roast' => $coffee['roast'],
            'origin' => $coffee['origin'],
            'descId' => $coffee['descId'],
            'descEn' => $coffee['descEn'],
        ], self::coffees());
    }

    public static function storefront(): array
    {
        $drinks = array_map(fn (array $coffee) => [
            '_id' => $coffee['_id'],
            'title' => $coffee['name'],
            'price' => $coffee['price'],
            'origin' => $coffee['origin'],
            'notes' => $coffee['notes'],
            'processing' => $coffee['processing'],
            'roast' => $coffee['roast'],
            'roastValue' => $coffee['roastValue'],
            'badgeType' => $coffee['badgeType'],
            'description' => $coffee['description'],
            'gallery' => [$coffee['image'], $coffee['image'], $coffee['image']],
            'image' => $coffee['image'],
        ], self::coffees());

        return array_merge($drinks, self::merchandise());
    }

    private static function coffees(): array
    {
        return [
            [
                '_id' => 1,
                'name' => 'LA KINTAMANI',
                'price' => 120000,
                'image' => '/product-kintamani.jpg',
                'notes' => 'Citrus, Floral, Bright Acidity',
                'roast' => 'Light Roast',
                'origin' => 'Kintamani',
                'processing' => 'Washed Process',
                'roastValue' => '25%',
                'badgeType' => 'bestseller',
                'description' => 'A refreshing single origin from the highlands of Bali. The washed process highlights its bright citrus notes and delicate floral aroma, making it a perfect morning brew.',
                'descId' => 'Single origin dari dataran tinggi Kintamani. Proses washed menonjolkan citrus cerah dan aroma floral — seduhan pagi yang menyegarkan.',
                'descEn' => 'Single origin from the Kintamani highlands. The washed process highlights bright citrus and delicate floral aroma — a refreshing morning brew.',
            ],
            [
                '_id' => 2,
                'name' => 'LA PLAGA',
                'price' => 135000,
                'image' => '/product-plaga.jpg',
                'notes' => 'Dark Chocolate, Brown Sugar, Bold',
                'roast' => 'Medium-Dark Roast',
                'origin' => 'Plaga Highlands',
                'processing' => 'Anaerobic Natural',
                'roastValue' => '75%',
                'badgeType' => 'new',
                'description' => 'The signature house blend for the perfect daily brew. Through an extended anaerobic natural fermentation process, we\'ve unlocked unparalleled fruit clarity and profound depth. Expect an intensely syrupy body paired with vibrant dark berry notes and a lingering, luxurious chocolate finish.',
                'descId' => 'Signature house blend untuk seduhan harian. Fermentasi anaerobic natural memberi body syrupy, buah beri gelap, dan finish cokelat mewah.',
                'descEn' => 'The signature house blend for the perfect daily brew. Anaerobic natural fermentation brings syrupy body, dark berries, and a luxurious chocolate finish.',
            ],
            [
                '_id' => 3,
                'name' => 'LA PUPUAN',
                'price' => 110000,
                'image' => '/product-pupuan.jpg',
                'notes' => 'Earthy, Nutty, Full Body',
                'roast' => 'Medium Roast',
                'origin' => 'Pupuan',
                'processing' => 'Honey Process',
                'roastValue' => '50%',
                'badgeType' => null,
                'description' => 'A robust classic that stands up well to milk. Grown in the rich soils of Pupuan, this coffee offers a comforting, full-bodied experience with prominent earthy and nutty undertones.',
                'descId' => 'Klasik robust dari tanah subur Pupuan. Full-bodied dengan earthy dan nutty yang menenangkan — cocok dipadukan susu.',
                'descEn' => 'A robust classic from the rich soils of Pupuan. Full-bodied with comforting earthy and nutty undertones — stands up well to milk.',
            ],
        ];
    }

    private static function merchandise(): array
    {
        return [
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
                'image' => '/product tumblr kopi.jpg',
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
                'image' => '/product cangkir kopi.jpg',
            ],
        ];
    }
}
