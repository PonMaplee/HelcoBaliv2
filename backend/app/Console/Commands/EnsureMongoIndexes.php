<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\CatalogProduct;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\RestockRequest;
use App\Models\ShiftReport;
use App\Models\StockRow;
use App\Models\Store;
use App\Models\User;
use Illuminate\Console\Command;
use Throwable;

/**
 * Creates the MongoDB indexes the list and auth queries rely on.
 * Safe to run on every deploy; createIndex is a no-op when the same index already exists.
 */
class EnsureMongoIndexes extends Command
{
    protected $signature = 'mongo:indexes';

    protected $description = 'Create MongoDB indexes for auth and the main list queries';

    public function handle(): int
    {
        if (config('database.default') !== 'mongodb') {
            $this->warn('Skipping Mongo indexes because DB_CONNECTION is not mongodb.');

            return self::SUCCESS;
        }

        $indexes = [
            [User::class, ['email' => 1], ['unique' => true, 'name' => 'email_1']],
            [Store::class, ['status' => 1], ['name' => 'status_1']],
            [Store::class, ['ownerEmail' => 1], ['name' => 'ownerEmail_1']],
            [CatalogProduct::class, ['name' => 1], ['name' => 'name_1']],
            [StockRow::class, ['batch' => 1], ['name' => 'batch_1']],
            [StockRow::class, ['storeId' => 1], ['name' => 'storeId_1']],
            [StockRow::class, ['expires' => 1], ['name' => 'expires_1']],
            [StockRow::class, ['storeId' => 1, 'productId' => 1, 'batch' => 1], ['name' => 'store_product_batch_1']],
            [RestockRequest::class, ['storeId' => 1], ['name' => 'storeId_1']],
            [RestockRequest::class, ['status' => 1], ['name' => 'status_1']],
            [RestockRequest::class, ['created' => -1], ['name' => 'created_1']],
            [ProductionBatch::class, ['batch' => 1], ['name' => 'batch_1']],
            [ProductionBatch::class, ['storeId' => 1], ['name' => 'storeId_1']],
            [ProductionBatch::class, ['expires' => 1], ['name' => 'expires_1']],
            [ProductionBatch::class, ['status' => 1], ['name' => 'status_1']],
            [ProductionBatch::class, ['productId' => 1], ['name' => 'productId_1']],
            [ShiftReport::class, ['storeId' => 1, 'date' => -1], ['name' => 'store_date_1']],
            [Activity::class, ['storeId' => 1, 'date' => -1], ['name' => 'store_date_1']],
            [Activity::class, ['kind' => 1], ['name' => 'kind_1']],
            [Product::class, ['title' => 1], ['name' => 'title_1']],
        ];

        foreach ($indexes as [$model, $keys, $options]) {
            try {
                $model::raw(function ($collection) use ($keys, $options) {
                    $collection->createIndex($keys, $options);

                    return null;
                });
                $this->line($model.' → '.($options['name'] ?? 'index'));
            } catch (Throwable $e) {
                $this->error($model.' index failed: '.$e->getMessage());

                return self::FAILURE;
            }
        }

        $this->info('MongoDB indexes are in place.');

        return self::SUCCESS;
    }
}
