# 🛠️ Setup — Desenvolvimento

Guia de instalação do ambiente de desenvolvimento no WSL/Linux.

## Pré-requisitos

- **Node.js 24.x** (via nvm)
- **Docker Engine** + **Docker Compose** (CLI only, sem Docker Desktop)
- **Git**
- **build-essential** (para compilar native addons: better-sqlite3, bcrypt)

## 1. Clonar o repositório

```bash
git clone https://github.com/shyland-dev/helios.git
cd helios
```

## 2. Node.js

```bash
# Instalar/atualizar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Usar versão do .nvmrc
nvm install
nvm use

# Verificar
node --version  # v24.x
```

## 3. Build tools (para native addons)

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

## 4. Variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` com seus valores:
- `HELIOS_JWT_SECRET` — string aleatória (64+ chars)
- `HELIOS_ENCRYPTION_KEY` — 32 bytes em hex (64 chars hex)
- `GROWATT_API_TOKEN` — seu token da Growatt Open API

Para gerar chaves:
```bash
# JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# Encryption key (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Frontend

```bash
cd frontend
npm install
npm start
# Acesse: http://localhost:4200
```

## 6. Backend

```bash
cd backend
npm install
npm run dev
# API em: http://localhost:3000
# Swagger: http://localhost:3000/docs
```

## 7. Criar primeiro usuário (via CLI)

```bash
cd backend
npm run cli -- user create -u admin -p senhasegura123 -t SEU_TOKEN_GROWATT
npm run cli -- invite create
# Copie o código gerado para usar no registro via UI
```

## 8. Docker (opcional para dev)

```bash
# Subir tudo com hot-reload
docker compose -f docker-compose.dev.yml up --build
```

## Estrutura de diretórios

```
helios/
├── frontend/     # Angular 21 (porta 4200)
├── backend/      # Fastify 5 (porta 3000)
├── docs/         # Documentação
├── .env          # Variáveis de ambiente (não commitado)
└── .env.example  # Template
```
