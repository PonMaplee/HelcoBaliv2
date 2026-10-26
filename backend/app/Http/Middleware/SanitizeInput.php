<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Strips HTML and Mongo operator keys from API input so stored strings cannot carry markup
 * and query documents cannot inject operators. Regex metacharacters are escaped later, at query time.
 */
class SanitizeInput
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->query->replace($this->clean($request->query->all()));

        if ($request->isJson()) {
            $request->json()->replace($this->clean($request->json()->all()));
        } else {
            $request->request->replace($this->clean($request->request->all()));
        }

        return $next($request);
    }

    private function clean(mixed $value, ?string $key = null): mixed
    {
        if ($key === 'password') {
            return is_string($value) ? str_replace("\0", '', $value) : $value;
        }

        if (is_array($value)) {
            $clean = [];
            foreach ($value as $childKey => $child) {
                if (is_string($childKey) && str_starts_with($childKey, '$')) {
                    continue;
                }
                $clean[$childKey] = $this->clean($child, is_string($childKey) ? $childKey : null);
            }

            return $clean;
        }

        if (is_string($value)) {
            return trim(strip_tags(str_replace("\0", '', $value)));
        }

        return $value;
    }
}
