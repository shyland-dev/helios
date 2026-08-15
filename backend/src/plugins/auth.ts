import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface AuthPluginOptions {
  jwtSecret: string;
}

const SALT_ROUNDS = 12;

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (password: string, hash: string) => Promise<boolean>;
    generateJti: () => string;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: number; username: string; jti: string };
    user: { sub: number; username: string; jti: string };
  }
}

async function authPluginFn(fastify: FastifyInstance, opts: AuthPluginOptions) {
  // Registrar JWT (sem expiração — revogação via allowlist de sessões)
  await fastify.register(fastifyJwt, {
    secret: opts.jwtSecret,
  });

  // Decorator: verificar autenticação
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { sub: number; username: string; jti: string };

      // Verificar se a sessão não foi revogada (allowlist)
      const session = fastify.db
        .prepare('SELECT id FROM sessions WHERE jti = ? AND revoked_at IS NULL')
        .get(payload.jti) as { id: number } | undefined;

      if (!session) {
        return reply.status(401).send({ error: 'Sessão revogada ou inválida' });
      }
    } catch {
      return reply.status(401).send({ error: 'Token inválido ou ausente' });
    }
  });

  // Decorator: hash de senha
  fastify.decorate('hashPassword', async (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
  });

  // Decorator: verificar senha
  fastify.decorate('verifyPassword', async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  });

  // Decorator: gerar JTI único
  fastify.decorate('generateJti', () => {
    return randomUUID();
  });

  fastify.log.info('[auth] Plugin de autenticação registrado');
}

export const authPlugin = fp(authPluginFn, {
  name: 'helios-auth',
  dependencies: ['helios-db'],
});
