// Rotas de plantas (usinas solares)
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GrowattService, GrowattServiceError } from '../services/growatt.service.js';
import { loadConfig } from '../config.js';

interface PlantIdParams {
  id: string;
}

interface EnergyHistoryQuery {
  start_date: string;
  end_date: string;
  time_unit?: string;
  page?: string;
  perpage?: string;
}

export async function plantRoutes(fastify: FastifyInstance) {
  const config = loadConfig();
  const growattService = new GrowattService({
    baseUrl: config.growatt.baseUrl,
    cacheTtlMs: config.growatt.cacheTtlMs,
    encryptionKey: config.encryption.key,
    db: fastify.db,
  });

  // Middleware de autenticação para todas as rotas de plantas
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /api/plants — Lista plantas do usuário
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Plants'],
        summary: 'Lista plantas do usuário',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as { sub: number };
      try {
        const data = await growattService.request(user.sub, 'plant/list');
        return reply.send({ data });
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // GET /api/plants/:id/energy — Overview de energia da planta
  fastify.get(
    '/:id/energy',
    {
      schema: {
        tags: ['Plants'],
        summary: 'Overview de energia da planta',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlantIdParams }>, reply: FastifyReply) => {
      const user = request.user as { sub: number };
      const { id } = request.params;
      try {
        const data = await growattService.request(user.sub, 'plant/data', { plant_id: id });
        return reply.send({ data });
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // GET /api/plants/:id/energy/history — Histórico de energia da planta
  fastify.get(
    '/:id/energy/history',
    {
      schema: {
        tags: ['Plants'],
        summary: 'Histórico de energia da planta',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        querystring: {
          type: 'object',
          required: ['start_date', 'end_date'],
          properties: {
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            time_unit: { type: 'string', enum: ['day', 'month', 'year'] },
            page: { type: 'string' },
            perpage: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlantIdParams; Querystring: EnergyHistoryQuery }>,
      reply: FastifyReply,
    ) => {
      const user = request.user as { sub: number };
      const { id } = request.params;
      const { start_date, end_date, time_unit, page, perpage } = request.query;

      const params: Record<string, string> = { plant_id: id, start_date, end_date };
      if (time_unit) params.time_unit = time_unit;
      if (page) params.page = page;
      if (perpage) params.perpage = perpage;

      try {
        const data = await growattService.request(user.sub, 'plant/energy/history', params);
        return reply.send({ data });
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // GET /api/plants/:id/devices — Dispositivos da planta
  fastify.get(
    '/:id/devices',
    {
      schema: {
        tags: ['Plants'],
        summary: 'Dispositivos da planta',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlantIdParams }>, reply: FastifyReply) => {
      const user = request.user as { sub: number };
      const { id } = request.params;
      try {
        const data = await growattService.request(user.sub, 'device/list', { plant_id: id });
        return reply.send({ data });
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );
}
