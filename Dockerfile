FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend/react-app

COPY frontend/react-app/package*.json ./
RUN npm ci

COPY frontend/react-app/ ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html/
COPY --from=frontend-build /app/frontend/react-app/dist/ /var/www/html/
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

RUN mkdir -p /var/www/html/backend/storage/sessions \
    && chown -R www-data:www-data /var/www/html/backend/storage \
    && a2enmod rewrite headers

EXPOSE 10000

CMD ["bash", "-lc", "PORT=${PORT:-10000}; sed -i \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf; sed -i \"s/<VirtualHost \\*:80>/<VirtualHost *:${PORT}>/\" /etc/apache2/sites-available/000-default.conf; apache2-foreground"]
