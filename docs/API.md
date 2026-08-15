# 📡 API — Referência

Documentação dos endpoints da Helios API.

> **Swagger UI interativo:** http://localhost:3000/docs (em dev) ou http://<host>/docs (em produção)

## Base URL

- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `http://<host>/api` (via Nginx proxy)

## Autenticação

Todas as rotas (exceto `/api/auth/*` e `/api/health`) requerem JWT no header:

```
Authorization: Bearer <token>
```

O token é obtido via login ou registro.

---

## Endpoints

### Health

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/health` | Health check | Não |

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Registro com invite code | Não |
| POST | `/api/auth/login` | Login (retorna JWT) | Não |

#### POST /api/auth/register

```json
{
  "username": "string (3-32 chars)",
  "password": "string (8-128 chars)",
  "invite_code": "uuid"
}
```

**Resposta (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "meuuser" }
}
```

#### POST /api/auth/login

```json
{
  "username": "string",
  "password": "string"
}
```

**Resposta (200):** mesmo formato do register.

---

### Plantas

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/plants` | Lista plantas do usuário | JWT |
| GET | `/api/plants/:id/energy` | Overview de energia | JWT |
| GET | `/api/plants/:id/energy/history` | Histórico de energia | JWT |
| GET | `/api/plants/:id/devices` | Dispositivos da planta | JWT |

#### GET /api/plants/:id/energy/history

**Query params:**
- `start_date` (obrigatório) — ex: `2024-01-01`
- `end_date` (obrigatório) — ex: `2024-12-31`
- `time_unit` — `day`, `month`, `year`
- `page` — paginação
- `perpage` — itens por página

---

### Dispositivos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/devices/:sn/detail` | Dados real-time | JWT |
| GET | `/api/devices/:sn/energy` | Energia do dispositivo | JWT |
| GET | `/api/devices/:sn/energy/history` | Histórico de energia | JWT |

#### GET /api/devices/:sn/energy/history

**Query params:**
- `start_date` — ex: `2024-01-01`
- `end_date` — ex: `2024-12-31`
- `timezone` — ex: `America/Sao_Paulo`
- `page` — paginação
- `limit` — itens por página

---

## Cache

Todas as respostas da Growatt API são cacheadas por 5 minutos por usuário. Se a Growatt retornar erro de frequência (código 10012), o backend retorna o cache expirado.

## Erros

```json
{
  "error": "Mensagem descritiva do erro"
}
```

| Status | Significado |
|--------|------------|
| 400 | Request inválido |
| 401 | Não autenticado / sessão revogada |
| 409 | Conflito (ex: username já existe) |
| 429 | Rate limit excedido |
| 500 | Erro interno |
