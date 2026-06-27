FROM php:8.2-apache

# Instalar extensión para PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pdo pdo_pgsql

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Establecer DocumentRoot a /var/www/html/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar todo (src/, public/, etc.) a /var/www/html/
COPY . /var/www/html/

# Copiar explícitamente public/ (por si acaso)
COPY public/ /var/www/html/public/

# Depuración: verificar que public/ existe
RUN ls -la /var/www/html/public/ || echo "public/ no existe"

# Ajustar permisos
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]