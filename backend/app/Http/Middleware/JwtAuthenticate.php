<?php

namespace App\Http\Middleware;

use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Requires Authorization: Bearer <jwt>. Missing or invalid tokens return 401.
 */
class JwtAuthenticate
{
    public function __construct(private JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->jwt->userFromToken($request->bearerToken());

        if (! $user) {
            return response()->json(['message' => 'Tidak terautentikasi.'], 401);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
