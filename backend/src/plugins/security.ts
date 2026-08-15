import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

export interface SecurityPluginOptions {
  frontendUrl: string;
}

async function securityPluginFn(fastify: FastifyInstance, opts: SecurityPluginOptions) {
  // Helmet: headers de segurança HTTP
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Desabilitado para não interferir com o frontend
  });

  // CORS: restrito ao domínio do frontend
  await fastify.register(cors, {
    origin: opts.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  fastify.log.info(`[security] Helmet + CORS configurados (origin: ${opts.frontendUrl})`);
}

export const securityPlugin = fp(securityPluginFn, {
  name: 'helios-security',
});
