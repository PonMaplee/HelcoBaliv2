<?php

/**
 * Concurrent load probe for a main API endpoint.
 *
 *   php scripts/loadtest.php
 *   LOAD_URL=http://127.0.0.1:8000/api/products?page=1&per_page=20 LOAD_CONCURRENCY=10 LOAD_REQUESTS=40 php scripts/loadtest.php
 */

$url = getenv('LOAD_URL') ?: 'http://127.0.0.1:8000/api/products?page=1&per_page=20';
$concurrency = max(1, (int) (getenv('LOAD_CONCURRENCY') ?: 10));
$total = max(1, (int) (getenv('LOAD_REQUESTS') ?: 40));

$times = [];
$statuses = [];
$errors = 0;
$started = microtime(true);
$offset = 0;

while ($offset < $total) {
    $batch = min($concurrency, $total - $offset);
    $multi = curl_multi_init();
    $handles = [];

    for ($i = 0; $i < $batch; $i++) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        curl_multi_add_handle($multi, $ch);
        $handles[] = $ch;
    }

    $running = null;
    do {
        $status = curl_multi_exec($multi, $running);
        if ($running) {
            curl_multi_select($multi, 1);
        }
    } while ($running && $status === CURLM_OK);

    foreach ($handles as $ch) {
        $info = curl_getinfo($ch);
        $code = (int) ($info['http_code'] ?? 0);
        $seconds = (float) ($info['total_time'] ?? 0);
        if ($code === 0 || curl_errno($ch)) {
            $errors++;
        }
        $statuses[$code] = ($statuses[$code] ?? 0) + 1;
        $times[] = $seconds * 1000;
        curl_multi_remove_handle($multi, $ch);
        curl_close($ch);
    }
    curl_multi_close($multi);
    $offset += $batch;
}

sort($times);
$count = count($times);
$avg = $count ? array_sum($times) / $count : 0;
$p95Index = $count ? (int) ceil($count * 0.95) - 1 : 0;
$elapsed = microtime(true) - $started;

$summary = [
    'url' => $url,
    'requests' => $total,
    'concurrency' => $concurrency,
    'errors' => $errors,
    'statuses' => $statuses,
    'elapsed_ms' => round($elapsed * 1000, 1),
    'min_ms' => $count ? round($times[0], 1) : null,
    'avg_ms' => round($avg, 1),
    'p95_ms' => $count ? round($times[$p95Index], 1) : null,
    'max_ms' => $count ? round($times[$count - 1], 1) : null,
];

echo json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
exit($errors > 0 || (($statuses[200] ?? 0) !== $total) ? 1 : 0);
