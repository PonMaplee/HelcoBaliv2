<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

/**
 * HS256 JWT access tokens for the dashboard API.
 * The subject is the Mongo user id. Roles travel in the payload and are re-read from the user record.
 */
class JwtService
{
    public function issue(User $user): string
    {
        $now = time();
        $ttlMinutes = max(1, (int) config('helco.jwt_ttl', 1440));

        return JWT::encode([
            'iss' => (string) config('app.url'),
            'sub' => (string) $user->getKey(),
            'email' => (string) $user->email,
            'role' => (string) $user->role,
            'iat' => $now,
            'exp' => $now + ($ttlMinutes * 60),
        ], $this->secret(), 'HS256');
    }

    public function userFromToken(?string $token): ?User
    {
        if (! is_string($token) || $token === '') {
            return null;
        }

        try {
            $decoded = JWT::decode($token, new Key($this->secret(), 'HS256'));
            $id = isset($decoded->sub) ? (string) $decoded->sub : '';
            if ($id === '') {
                return null;
            }

            return User::find($id);
        } catch (Throwable) {
            return null;
        }
    }

    private function secret(): string
    {
        $secret = (string) config('helco.jwt_secret');
        if ($secret !== '') {
            return $secret;
        }

        $key = (string) config('app.key');
        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);
            if (is_string($decoded) && $decoded !== '') {
                return $decoded;
            }
        }
        if ($key !== '') {
            return $key;
        }

        throw new \RuntimeException('JWT secret is not configured. Set JWT_SECRET or APP_KEY.');
    }
}
