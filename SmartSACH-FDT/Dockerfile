# ==========================================
# ETAPA 1: Compilación de la App con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos los archivos de configuración de dependencias
COPY package*.json ./

# Instalamos todos los módulos de node (incluyendo Leaflet y React Router)
RUN npm install

# Copiamos todo el código fuente del proyecto al contenedor
COPY . .

# SOLUCIÓN CRÍTICA: Forzamos a Vite a saber dónde está el punto de entrada.
# Si index.html no está en la raíz por alguna reestructuración de carpetas,
# le indicamos a Vite que use el directorio actual explícitamente.
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiamos el resultado empaquetado por Vite (carpeta dist) al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Añadimos una configuración de Nginx adaptada para React Router
# Esto evita pantallas en blanco o errores 404 al recargar rutas internas de la app
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]