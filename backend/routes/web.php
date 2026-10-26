<?php

use App\Http\Controllers\DocsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs', [DocsController::class, 'ui']);
Route::get('/openapi.yaml', [DocsController::class, 'spec']);
