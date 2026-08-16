# ═══════════════════════════════════════════════════════════════════════════════
# Helios Backend — Multi-stage Build
# Suporta multi-arch: ARM64 (Raspberry Pi) + AMD64 (dev)
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Estágio 1: Build ─────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

# Dependências para native addons (better-sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Instalar todas as dependências (inclui devDependencies para compilar)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte e compilar
COPY tsconfig.json ./
COPY src/ ./src/
COPY cli/ ./cli/
RUN npm run build

# ─── Estágio 2: Produção ──────────────────────────────────────────────────────
FROM node:24-alpine AS production

# Dependências para native addons (better-sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Instalar apenas dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && \
    # Limpar cache e build tools após instalação
    apk del python3 make g++ && \
    rm -rf /root/.npm /tmp/*

# Copiar código compilado do estágio builder
COPY --from=builder /app/dist/ ./dist/

# Criar diretório de dados
RUN mkdir -p /app/data && chown -R node:node /app/data

# Rodar como usuário não-root
USER node

# Variáveis padrão
ENV HELIOS_DB_PATH=/app/data/helios.db
ENV HELIOS_API_PORT=3000
ENV HELIOS_API_HOST=0.0.0.0

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/src/index.js"]
