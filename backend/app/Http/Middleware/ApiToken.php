<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Autentikasi token bearer sederhana untuk dashboard B2B.
 * Token dibuat saat login/register dan disimpan di kolom api_token user.
 */
class ApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', $token)->first() : null;

        if (! $user) {
            return response()->json(['message' => 'Tidak terautentikasi.'], 401);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
