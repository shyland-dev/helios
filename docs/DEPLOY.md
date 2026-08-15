# 🚀 Deploy — Docker + Raspberry Pi

Guia de deploy via Docker Compose no Raspberry Pi (ou qualquer servidor Linux).

## Pré-requisitos (servidor)

- Raspberry Pi com 16GB RAM + 128GB storage (ou VPS/servidor Linux)
- Docker Engine instalado via script oficial
- Git
- Porta 80 redirecionada no roteador (para acesso externo)

## 1. Instalar Docker no RPi

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reiniciar sessão
```

## 2. Clonar e configurar

```bash
git clone https://github.com/shyland-dev/helios.git
cd helios

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # preencher com seus valores
```

## 3. Build e deploy

```bash
# Build multi-arch (ARM64 para RPi)
docker compose build

# Subir em background
docker compose up -d
```

## 4. Criar primeiro usuário

```bash
# Executar CLI dentro do container
docker compose exec helios-api node dist/cli/index.js user create -u admin -p senhasegura123 -t SEU_TOKEN_GROWATT

# Gerar invite code
docker compose exec helios-api node dist/cli/index.js invite create
```

## 5. Verificar

```bash
# Status dos containers
docker compose ps

# Logs
docker compose logs -f

# Health check
curl http://localhost/api/health
```

## 6. Acessar

- **Aplicação:** http://<IP_DO_RPI>
- **Swagger API:** http://<IP_DO_RPI>/docs

## Comandos úteis

```bash
# Atualizar (pull + rebuild)
git pull
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f helios-api
docker compose logs -f helios-web

# Restart
docker compose restart

# Parar tudo
docker compose down

# Parar e remover volumes (⚠️ perde dados)
docker compose down -v
```

## Backup do banco de dados

O SQLite fica em um Docker volume. Para backup:

```bash
# Copiar do volume para host
docker compose cp helios-api:/app/data/helios.db ./backup-helios.db

# Restaurar
docker compose cp ./backup-helios.db helios-api:/app/data/helios.db
docker compose restart helios-api
```

## HTTPS (produção)

Para HTTPS, use um reverse proxy externo (Caddy, Traefik, ou Nginx com Certbot):

```bash
# Exemplo com Caddy (automático Let's Encrypt)
sudo apt install caddy

# /etc/caddy/Caddyfile
meu-dominio.com {
    reverse_proxy localhost:80
}
```
