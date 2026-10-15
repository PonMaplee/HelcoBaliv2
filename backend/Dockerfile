FROM php:8.5-cli-alpine

RUN apk add --no-cache $PHPIZE_DEPS git unzip openssl-dev oniguruma-dev \
 && docker-php-ext-install mbstring \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

# ponytail: artisan serve (PHP built-in) bukan nginx/php-fpm — 1 baris, cukup buat demo
ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 8000

# ponytail: seed dijalankan sekali manual (bukan tiap start) — kalau tiap start, produk yang
# ditambah lewat dashboard B2B bakal ke-reset ke 5 seed produk setiap server bangun dari tidur.
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT"]
