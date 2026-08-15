# ═══════════════════════════════════════════════════════════════════════════════
# Helios Frontend — Multi-stage build: Node (build) → Nginx (serve)
# Suporta multi-arch: ARM64 (Raspberry Pi) + AMD64 (dev)
# ═══════════════════════════════════════════════════════════════════════════════

# --- Stage 1: Build ---
FROM node:24-alpine AS builder

WORKDIR /app

# Instalar dependências primeiro (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copiar código fonte e buildar
COPY . .
RUN npm run sync-version && npx ng build --configuration=production

# --- Stage 2: Serve ---
FROM nginx:alpine AS production

# Remover config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar config customizada
COPY nginx.conf /etc/nginx/conf.d/helios.conf

# Copiar build do Angular
COPY --from=builder /app/dist/helios/browser /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
