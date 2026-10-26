<?php

namespace App\Http\Controllers;

/**
 * Swagger UI and the OpenAPI document.
 * The YAML also lives in public/ so a static file server can deliver it.
 * This controller is what PHPUnit and hosts that route every path through index.php use.
 */
class DocsController extends Controller
{
    public function ui()
    {
        return view('docs');
    }

    public function spec()
    {
        $path = public_path('openapi.yaml');
        abort_unless(is_file($path), 404);

        return response(file_get_contents($path), 200, [
            'Content-Type' => 'application/yaml; charset=UTF-8',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
