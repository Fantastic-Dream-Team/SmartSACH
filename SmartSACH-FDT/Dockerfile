# ==========================================
# ETAPA 1: Compilación de la App con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos los manifiestos de dependencias
COPY package*.json ./

# Instalamos todas las librerías necesarias (incluyendo Leaflet y React Router)
RUN npm install

# Copiamos el resto de los archivos del frontend
COPY . .

# Compilamos el proyecto. Vite generará todo el código en la carpeta 'dist'
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiamos el resultado de la compilación de Vite al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada para que Nginx no dé errores 404 con las rutas de React
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