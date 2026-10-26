<?php

namespace Tests\Feature;

use App\Models\CatalogProduct;
use App\Models\Product;
use App\Models\RestockRequest;
use App\Models\StockRow;
use App\Models\Store;
use App\Models\User;
use Tests\TestCase;

class SrsApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach ([User::class, Store::class, CatalogProduct::class, StockRow::class, RestockRequest::class, Product::class] as $model) {
            $model::query()->delete();
        }
    }

    public function test_register_and_login_issue_a_jwt(): void
    {
        $registered = $this->postJson('/api/dashboard/register', $this->staffPayload());

        $registered->assertCreated();
        $token = $registered->json('token');
        $this->assertIsString($token);
        $this->assertCount(3, explode('.', $token));

        $this->getJson('/api/dashboard/me')->assertUnauthorized();
        $this->withToken('not-a-real-jwt')->getJson('/api/dashboard/me')->assertUnauthorized();
        $this->withToken($token)->getJson('/api/dashboard/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'sari@example.com')
            ->assertJsonPath('user.role', 'staff');

        $login = $this->postJson('/api/dashboard/login', [
            'email' => 'sari@example.com',
            'password' => 'secret1',
        ]);
        $login->assertOk();
        $this->assertCount(3, explode('.', $login->json('token')));
    }

    public function test_staff_is_forbidden_on_an_admin_route(): void
    {
        $token = $this->postJson('/api/dashboard/register', $this->staffPayload())->json('token');

        $this->withToken($token)->postJson('/api/dashboard/products', [
            'name' => 'Tidak Boleh',
            'price' => 1000,
        ])->assertForbidden();
    }

    public function test_invalid_input_returns_400(): void
    {
        $this->postJson('/api/dashboard/register', [
            'email' => 'bukan-email',
        ])->assertStatus(400)
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_html_in_string_input_is_stripped(): void
    {
        $this->postJson('/api/dashboard/register', [
            'name' => '<script>x</script>Budi',
            'email' => 'budi@example.com',
            'password' => 'secret1',
            'storeName' => 'Gerai Budi',
            'location' => 'Ubud',
        ])->assertCreated()
            ->assertJsonPath('user.name', 'xBudi');
    }

    public function test_missing_record_returns_404(): void
    {
        $this->getJson('/api/products/999999')
            ->assertNotFound()
            ->assertJsonPath('message', 'Produk tidak ditemukan');
    }

    public function test_public_products_are_paginated_and_searchable(): void
    {
        Product::create(['title' => 'Alpha Coffee', 'price' => 10000, 'origin' => 'A', 'notes' => 'citrus', 'roast' => 'Light']);
        Product::create(['title' => 'Beta Coffee', 'price' => 20000, 'origin' => 'B', 'notes' => 'cocoa', 'roast' => 'Dark']);

        $page = $this->getJson('/api/products?page=1&per_page=1&sort=title&order=asc');
        $page->assertOk();
        $page->assertJsonPath('meta.current_page', 1);
        $page->assertJsonPath('meta.per_page', 1);
        $page->assertJsonPath('meta.total', 2);
        $page->assertJsonPath('meta.last_page', 2);
        $this->assertCount(1, $page->json('data'));
        $this->assertSame('Alpha Coffee', $page->json('data.0.title'));

        $search = $this->getJson('/api/products?q=Beta&sort=title&order=asc');
        $search->assertOk();
        $search->assertJsonPath('meta.total', 1);
        $this->assertSame('Beta Coffee', $search->json('data.0.title'));
    }

    public function test_dashboard_lists_support_search_sort_and_created_status(): void
    {
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@helcobali.id',
            'password' => 'admin123',
            'role' => 'admin',
            'storeId' => null,
        ]);
        $token = $this->postJson('/api/dashboard/login', [
            'email' => 'admin@helcobali.id',
            'password' => 'admin123',
        ])->assertOk()->json('token');

        $store = Store::create([
            'name' => 'Gerai Ubud',
            'location' => 'Ubud',
            'status' => 'Disetujui',
            'ownerEmail' => 'ubud@example.com',
        ]);

        $created = $this->withToken($token)->postJson('/api/dashboard/products', [
            'name' => 'La Zebra',
            'price' => 90000,
            'origin' => 'Tabanan',
            'notes' => 'honey',
            'roast' => 'Medium',
        ]);
        $created->assertCreated();
        $productId = collect($created->json('products'))->firstWhere('name', 'La Zebra')['id'];

        $this->withToken($token)->postJson('/api/dashboard/rows', [
            'storeId' => (string) $store->id,
            'productId' => (string) $productId,
            'batch' => 'BATCH-ZEBRA',
            'quantity' => 4,
            'expires' => '2026-12-01',
        ])->assertCreated();

        $rows = $this->withToken($token)->getJson('/api/dashboard/rows?q=ZEBRA&sort=batch&order=asc&per_page=10');
        $rows->assertOk();
        $rows->assertJsonPath('meta.total', 1);
        $this->assertSame('BATCH-ZEBRA', $rows->json('data.0.batch'));

        RestockRequest::create([
            'storeId' => (string) $store->id,
            'productId' => (string) $productId,
            'quantity' => 2,
            'status' => 'Diajukan',
            'customer' => 'Nyoman Search',
            'receiptId' => 'ORD-NYOMAN',
            'created' => '2026-10-01',
            'lines' => [],
        ]);

        $requests = $this->withToken($token)->getJson('/api/dashboard/requests?q=Nyoman&sort=created&order=desc');
        $requests->assertOk();
        $requests->assertJsonPath('meta.total', 1);
        $this->assertSame('ORD-NYOMAN', $requests->json('data.0.receiptId'));

        $this->assertNotNull($admin->id);
    }

    public function test_mongo_indexes_command_creates_the_email_index(): void
    {
        $this->artisan('mongo:indexes')->assertSuccessful();

        $names = [];
        User::raw(function ($collection) use (&$names) {
            foreach ($collection->listIndexes() as $index) {
                $names[] = $index->getName();
            }

            return null;
        });

        $this->assertContains('email_1', $names);
    }

    private function staffPayload(): array
    {
        return [
            'name' => 'Sari',
            'email' => 'sari@example.com',
            'password' => 'secret1',
            'storeName' => 'Gerai Sari',
            'location' => 'Denpasar',
        ];
    }
}
