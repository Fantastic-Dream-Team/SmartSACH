# Usamos una versión moderna de PHP con Apache incluido
FROM php:8.2-apache

# Instalamos los controladores para que PHP pueda hablar con PostgreSQL (Supabase)
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Copiamos todos tus archivos PHP a la carpeta del servidor web
COPY . /var/www/html/

# Habilitamos el módulo de reescritura de Apache (por si usas rutas amigables)
RUN a2enmod rewrite

# Exponemos el puerto 80
EXPOSE 80