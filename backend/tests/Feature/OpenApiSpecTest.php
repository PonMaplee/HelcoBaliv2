<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class OpenApiSpecTest extends TestCase
{
    public function test_the_spec_lists_every_api_route(): void
    {
        $spec = file_get_contents(public_path('openapi.yaml'));
        $published = file_get_contents(dirname(base_path()).'/docs/openapi.yaml');
        $this->assertSame($published, $spec);

        $documented = $this->operations($spec);
        $registered = [];
        foreach (Route::getRoutes() as $route) {
            $uri = '/'.ltrim($route->uri(), '/');
            if (! str_starts_with($uri, '/api/')) {
                continue;
            }
            foreach ($route->methods() as $method) {
                $method = strtolower($method);
                if (! in_array($method, ['get', 'post', 'put', 'patch', 'delete'], true)) {
                    continue;
                }
                $registered[] = $method.' '.$uri;
            }
        }

        sort($registered);
        $apiDocumented = array_values(array_filter(
            $documented,
            fn (string $operation) => str_contains($operation, ' /api/')
        ));
        sort($apiDocumented);

        $this->assertSame($registered, $apiDocumented);
        $this->assertCount(30, $registered);
        $this->assertContains('get /docs', $documented);
        $this->assertContains('get /openapi.yaml', $documented);
    }

    public function test_docs_and_spec_are_served(): void
    {
        $this->get('/docs')
            ->assertOk()
            ->assertSee('SwaggerUIBundle', false)
            ->assertSee('/openapi.yaml', false);

        $this->get('/openapi.yaml')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', '*')
            ->assertSee('openapi: 3.0.3', false);
    }

    /**
     * @return list<string>
     */
    private function operations(string $yaml): array
    {
        $operations = [];
        $path = null;
        foreach (preg_split("/\r\n|\n|\r/", $yaml) as $line) {
            if (preg_match('#^  (/[^:]+):\s*$#', $line, $match)) {
                $path = $match[1];
                continue;
            }
            if ($path && preg_match('#^    (get|post|put|patch|delete):\s*$#', $line, $match)) {
                $operations[] = $match[1].' '.$path;
            }
        }

        return $operations;
    }
}
