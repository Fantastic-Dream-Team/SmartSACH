# ==========================================
# ETAPA 1: Compilación del frontend con Vite
# ==========================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
RUN npm run build

# ==========================================
# ETAPA 2: Backend Express + estáticos compilados
# ==========================================
FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --omit=dev

COPY Backend/ ./
COPY --from=frontend-build /app/frontend/dist ./Frontend/dist

ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "src/server.js"]
