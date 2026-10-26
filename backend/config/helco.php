<?php

return [
    // First-run admin. Override in production; the fallback keeps a fresh seed able to sign in.
    'admin_email' => env('ADMIN_EMAIL', 'admin@helcobali.id'),
    'admin_password' => env('ADMIN_PASSWORD', 'admin123'),

    // HS256 signing key. Falls back to APP_KEY inside JwtService when this is empty.
    'jwt_secret' => env('JWT_SECRET'),
    // Token lifetime in minutes. 1440 = 24 hours.
    'jwt_ttl' => (int) env('JWT_TTL', 1440),
];
