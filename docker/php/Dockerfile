# syntax=docker/dockerfile:1

# ---------- base: shared PHP runtime ----------
FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    bash \
    git \
    curl \
    unzip \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    linux-headers \
    autoconf \
    g++ \
    make

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    zip \
    mbstring \
    opcache

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# php.ini lives at docker/php/php.ini; build context is the repo root.
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/backend

# ---------- dev: bind-mounted source, Symfony CLI, non-root ----------
# Target used by docker-compose. Application code is mounted at runtime,
# so nothing is COPYed here — behavior is identical to the original image.
FROM base AS dev

RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/bash -D appuser

RUN chown -R appuser:appgroup /var/www/backend

USER appuser

# ---------- prod: deployable image with the app baked in ----------
FROM base AS prod

ENV APP_ENV=prod \
    APP_DEBUG=0

# Install dependencies first (cached unless composer.json/lock change).
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --no-progress \
    --no-interaction \
    --optimize-autoloader

# Copy the application source and finalize the optimized autoloader.
COPY backend/ ./
RUN composer dump-autoload --no-dev --classmap-authoritative \
    && mkdir -p var \
    && rm -rf var/cache/* var/log/*

RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/bash -D appuser \
    && chown -R appuser:appgroup /var/www/backend

USER appuser

# JWT keys and migrations are runtime/deploy steps (see README).
CMD ["php-fpm"]
