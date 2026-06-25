# ==========================================
# ETAPA 1: Compilación del frontend con Vite
# Contexto Docker: raíz del repo (.)
# ==========================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY SmartSACH-FDT/Frontend/package*.json ./
RUN npm ci

COPY SmartSACH-FDT/Frontend/ ./
RUN npm run build

# ==========================================
# ETAPA 2: Backend Express + estáticos compilados
# ==========================================
FROM node:20-alpine

WORKDIR /app

COPY SmartSACH-FDT/Backend/package*.json ./
RUN npm ci --omit=dev

COPY SmartSACH-FDT/Backend/ ./
COPY --from=frontend-build /app/frontend/dist ./Frontend/dist

ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "src/server.js"]
