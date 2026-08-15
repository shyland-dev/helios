# ☀️ Helios

Painel de monitoramento solar (Growatt) com backend próprio, autenticação por convite, e deploy em Raspberry Pi via Docker.

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                     │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ helios-web   │  │ helios-api   │  │  SQLite   │ │
│  │ (Angular +   │→ │ (Fastify +   │→ │ (volume)  │ │
│  │  Nginx)      │  │  Node.js)    │  │           │ │
│  └──────────────┘  └──────┬───────┘  └───────────┘ │
│                           │                         │
└───────────────────────────┼─────────────────────────┘
                            │
                            ↓
                   ┌────────────────┐
                   │ Growatt Open   │
                   │ API V1         │
                   └────────────────┘
```

## Stack

| Camada   | Tecnologia                       | Justificativa                                  |
| -------- | -------------------------------- | ---------------------------------------------- |
| Frontend | Angular 21 + Nginx               | Standalone components, SSR-ready               |
| Backend  | Fastify 5 + TypeScript           | ~2x mais rápido que Express, schema validation |
| Banco    | SQLite (better-sqlite3)          | Zero overhead, perfeito para RPi               |
| Auth     | JWT + bcrypt                     | Token revogável via CLI admin                  |
| Infra    | Docker Compose (ARM64/AMD64)     | Portável, reproduzível                         |

## Estrutura

```
helios/
├── frontend/              # Angular 21
├── backend/               # Fastify 5 + TypeScript
│   └── cli/               # CLI de administração
├── docs/                  # Documentação detalhada
├── docker-compose.yml     # Produção
├── docker-compose.dev.yml # Desenvolvimento (Docker)
├── .env.example           # Template de variáveis
└── README.md
```

---

## 🖥️ Ambiente de Desenvolvimento (Local)

### Pré-requisitos

- **Node.js 24.x** (via [nvm](https://github.com/nvm-sh/nvm))
- **build-essential** (make, gcc, g++ — para compilar native addons)
- **Python 3** (usado pelo node-gyp)

```bash
# Instalar build tools (Ubuntu/Debian/WSL)
sudo apt-get update && sudo apt-get install -y build-essential python3
```

### 1. Clonar e configurar

```bash
git clone https://github.com/shyland-dev/helios.git
cd helios

# Usar versão correta do Node (lê .nvmrc)
nvm install
nvm use
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Gerar os valores de segurança:

```bash
# JWT secret (64 chars)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# Encryption key (32 bytes = 64 chars hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Preencher no `.env`:

```env
HELIOS_JWT_SECRET=<valor gerado acima>
HELIOS_ENCRYPTION_KEY=<valor gerado acima>
GROWATT_API_TOKEN=<seu token da Growatt Open API>
```

### 3. Backend

```bash
cd backend
npm ci
npm run dev
```

O servidor inicia em **http://localhost:3000** com hot-reload.
Swagger UI disponível em **http://localhost:3000/docs**.

### 4. Frontend

```bash
cd frontend
npm ci
npm start
```

O app Angular inicia em **http://localhost:4200** com proxy automático para o backend.

### 5. Criar primeiro usuário

```bash
cd backend

# Criar admin com token Growatt
npm run cli -- user create -u admin -p suaSenhaSegura -t SEU_TOKEN_GROWATT

# Gerar invite code para outros usuários
npm run cli -- invite create
```

### 6. Acessar

1. Abra **http://localhost:4200**
2. Clique em "Criar conta"
3. Use o invite code gerado + username + senha
4. Pronto! Dashboard disponível.

---

## 🐳 Ambiente de Produção (Docker)

### Pré-requisitos

- **Docker Engine** + **Docker Compose** ([instalar](https://get.docker.com))
- Porta 80 liberada

### 1. Clonar e configurar

```bash
git clone https://github.com/shyland-dev/helios.git
cd helios
cp .env.example .env
# Preencher .env com seus valores (ver seção acima)
```

### 2. Build e deploy

```bash
docker compose build
docker compose up -d
```

### 3. Criar primeiro usuário

```bash
docker compose exec helios-api npx tsx cli/index.ts user create -u admin -p suaSenhaSegura -t SEU_TOKEN_GROWATT
docker compose exec helios-api npx tsx cli/index.ts invite create
```

### 4. Verificar

```bash
# Status
docker compose ps

# Logs
docker compose logs -f

# Health check
curl http://localhost/api/health
```

### 5. Acessar

- **App:** http://localhost (ou http://IP_DO_SERVIDOR)
- **Swagger:** http://localhost/docs

### Comandos úteis

```bash
# Atualizar
git pull && docker compose build && docker compose up -d

# Backup do banco
docker compose cp helios-api:/app/data/helios.db ./backup.db

# Parar
docker compose down

# Parar + remover dados (⚠️ irreversível)
docker compose down -v
```

---

## 📖 Documentação

| Doc | Conteúdo |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | Instalação detalhada DEV (WSL/Linux) |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy Docker + Raspberry Pi |
| [docs/API.md](docs/API.md) | Referência dos endpoints |
| [docs/ADMIN.md](docs/ADMIN.md) | Guia da CLI de administração |

## Licença

Projeto privado — SHYLAND DEV LTDA.
