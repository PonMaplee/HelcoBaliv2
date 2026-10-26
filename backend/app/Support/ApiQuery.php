<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Shared list behaviour: escaped text search, allow-listed sort, and page/per_page envelopes.
 */
class ApiQuery
{
    public static function pattern(string $term): string
    {
        return '/'.preg_quote(trim($term), '/').'/i';
    }

    public static function whereText(Builder $query, Request $request, array $fields): Builder
    {
        $term = trim((string) $request->query('q', ''));
        if ($term === '' || $fields === []) {
            return $query;
        }

        $pattern = self::pattern($term);
        $query->where(function (Builder $inner) use ($fields, $pattern) {
            foreach (array_values($fields) as $index => $field) {
                if ($index === 0) {
                    $inner->where($field, 'regex', $pattern);
                } else {
                    $inner->orWhere($field, 'regex', $pattern);
                }
            }
        });

        return $query;
    }

    public static function applySort(Builder $query, Request $request, array $allowed, string $default, string $defaultOrder = 'asc'): Builder
    {
        $sort = (string) $request->query('sort', $default);
        if (! in_array($sort, $allowed, true)) {
            $sort = $default;
        }
        $order = strtolower((string) $request->query('order', $defaultOrder)) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $order);
    }

    public static function paginate(Builder $query, Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) {
            $perPage = 20;
        }
        $perPage = min($perPage, 100);

        $total = (clone $query)->count();
        $items = (clone $query)->forPage($page, $perPage)->get()->values();

        return response()->json([
            'data' => $items,
            'meta' => self::meta($page, $perPage, $total),
        ]);
    }

    public static function emptyPage(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) {
            $perPage = 20;
        }
        $perPage = min($perPage, 100);

        return response()->json([
            'data' => [],
            'meta' => self::meta(1, $perPage, 0),
        ]);
    }

    private static function meta(int $page, int $perPage, int $total): array
    {
        return [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }
}
