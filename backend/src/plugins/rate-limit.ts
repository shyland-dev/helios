import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

export interface RateLimitPluginOptions {
  max: number;
  windowMs: number;
}

async function rateLimitPluginFn(fastify: FastifyInstance, opts: RateLimitPluginOptions) {
  await fastify.register(rateLimit, {
    max: opts.max,
    timeWindow: opts.windowMs,
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Limite de requisições excedido. Tente novamente em breve.',
      statusCode: 429,
    }),
  });

  fastify.log.info(`[rate-limit] ${opts.max} req/${opts.windowMs}ms por IP`);
}

export const rateLimitPlugin = fp(rateLimitPluginFn, {
  name: 'helios-rate-limit',
});
