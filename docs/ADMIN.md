# 🔑 Admin — CLI de Administração

A CLI do Helios permite gerenciar usuários, convites e sessões diretamente no banco SQLite, sem passar pela API.

## Como executar

```bash
cd backend

# Via npm script
npm run cli -- <command>

# Via Docker (produção)
docker compose exec helios-api node dist/cli/index.js <command>
```

---

## Comandos

### 👤 Usuários

```bash
# Listar todos os usuários
helios user list

# Criar usuário (sem invite code)
helios user create -u <username> -p <password> [-t <growatt_token>]

# Remover usuário (revoga sessões automaticamente)
helios user delete <username>
```

**Exemplos:**

```bash
npm run cli -- user create -u admin -p minhaSenha123 -t abc123tokenGrowatt
npm run cli -- user list
npm run cli -- user delete convidado
```

### 🎫 Convites

```bash
# Gerar código de convite
helios invite create [--user-id <id>]

# Listar convites pendentes
helios invite list

# Listar todos os convites (incluindo usados)
helios invite list --all
```

**Exemplos:**

```bash
npm run cli -- invite create
# ✓ Código de convite gerado:
#   a1b2c3d4-e5f6-7890-abcd-ef1234567890
#   Compartilhe este código com o novo usuário.

npm run cli -- invite list
```

### 🔐 Sessões

```bash
# Listar sessões ativas
helios session list

# Listar todas as sessões (incluindo revogadas)
helios session list --all

# Revogar todas as sessões de um usuário
helios session revoke <username>

# Revogar TODAS as sessões (todos os usuários)
helios session revoke-all
```

**Exemplos:**

```bash
npm run cli -- session list
npm run cli -- session revoke convidado
npm run cli -- session revoke-all
```

---

## Fluxo típico: Primeiro acesso

1. Criar o primeiro usuário admin:
   ```bash
   npm run cli -- user create -u admin -p senhaSegura123 -t SEU_TOKEN_GROWATT
   ```

2. Gerar um invite code para um novo usuário:
   ```bash
   npm run cli -- invite create
   ```

3. Compartilhar o código com a pessoa.

4. A pessoa abre o site → cria conta com o código.

---

## Notas

- A CLI acessa o banco SQLite diretamente (`HELIOS_DB_PATH`)
- O token Growatt é encriptado com AES-256-GCM antes de salvar (requer `HELIOS_ENCRYPTION_KEY`)
- Revogar sessões invalida os JWTs imediatamente — o próximo request do usuário retorna 401
- Deletar um usuário remove cascata: sessões, invite codes usados, cache
