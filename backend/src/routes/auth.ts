import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InviteCodeService } from '../services/invite-code.service.js';

interface RegisterBody {
  username: string;
  password: string;
  invite_code: string;
}

interface LoginBody {
  username: string;
  password: string;
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
}

const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'password', 'invite_code'],
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 32 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      invite_code: { type: 'string', format: 'uuid' },
    },
  },
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
};

export async function authRoutes(fastify: FastifyInstance) {
  const inviteService = new InviteCodeService(fastify.db);

  // POST /api/auth/register
  fastify.post(
    '/register',
    { schema: registerSchema },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      const { username, password, invite_code } = request.body;

      // Verificar se o invite code é válido
      if (!inviteService.isValid(invite_code)) {
        return reply.status(400).send({ error: 'Código de convite inválido ou já utilizado' });
      }

      // Verificar se o username já existe
      const existingUser = fastify.db.prepare('SELECT id FROM users WHERE username = ?').get(username) as
        | { id: number }
        | undefined;

      if (existingUser) {
        return reply.status(409).send({ error: 'Nome de usuário já existe' });
      }

      // Criar usuário
      const passwordHash = await fastify.hashPassword(password);
      const result = fastify.db
        .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .run(username, passwordHash);

      const userId = result.lastInsertRowid as number;

      // Consumir o invite code
      inviteService.consume(invite_code, userId);

      // Criar sessão e gerar JWT
      const jti = fastify.generateJti();
      fastify.db.prepare('INSERT INTO sessions (user_id, jti) VALUES (?, ?)').run(userId, jti);

      const token = fastify.jwt.sign({ sub: userId, username, jti });

      return reply.status(201).send({
        token,
        user: { id: userId, username },
      });
    },
  );

  // POST /api/auth/login
  fastify.post(
    '/login',
    { schema: loginSchema },
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { username, password } = request.body;

      // Buscar usuário
      const user = fastify.db
        .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
        .get(username) as UserRow | undefined;

      if (!user) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const valid = await fastify.verifyPassword(password, user.password_hash);
      if (!valid) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      // Criar sessão e gerar JWT
      const jti = fastify.generateJti();
      fastify.db.prepare('INSERT INTO sessions (user_id, jti) VALUES (?, ?)').run(user.id, jti);

      const token = fastify.jwt.sign({ sub: user.id, username: user.username, jti });

      return reply.status(200).send({
        token,
        user: { id: user.id, username: user.username },
      });
    },
  );
}
