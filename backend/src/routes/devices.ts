// Rotas de dispositivos (inversores)
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GrowattService, GrowattServiceError } from '../services/growatt.service.js';
import { loadConfig } from '../config.js';

interface DeviceSnParams {
  sn: string;
}

interface DeviceEnergyHistoryQuery {
  start_date?: string;
  end_date?: string;
  timezone?: string;
  page?: string;
  limit?: string;
}

export async function deviceRoutes(fastify: FastifyInstance) {
  const config = loadConfig();
  const growattService = new GrowattService({
    baseUrl: config.growatt.baseUrl,
    cacheTtlMs: config.growatt.cacheTtlMs,
    encryptionKey: config.encryption.key,
    db: fastify.db,
  });

  // Middleware de autenticação para todas as rotas de dispositivos
  fastify.addHook('onRequest', fastify.authenticate);

  // Helper: tenta MIN primeiro, depois SPH
  async function tryMinThenSph(userId: number, endpoint: string, params: Record<string, string>) {
    try {
      const data = await growattService.request(userId, `device/min/${endpoint}`, params);
      return { data, device_type: 'min' };
    } catch (minError) {
      try {
        const data = await growattService.request(userId, `device/sph/${endpoint}`, params);
        return { data, device_type: 'sph' };
      } catch (sphError) {
        // Se ambos falharam, lançar o erro mais relevante
        throw sphError instanceof GrowattServiceError ? sphError : minError;
      }
    }
  }

  // GET /api/devices/:sn/detail — Dados real-time do dispositivo
  fastify.get(
    '/:sn/detail',
    {
      schema: {
        tags: ['Devices'],
        summary: 'Dados real-time do dispositivo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sn'],
          properties: { sn: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeviceSnParams }>, reply: FastifyReply) => {
      const user = request.user as { sub: number };
      const { sn } = request.params;

      try {
        const result = await tryMinThenSph(user.sub, 'detail', { device_sn: sn });
        return reply.send(result);
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error - device detail');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // GET /api/devices/:sn/energy — Energia do dispositivo
  fastify.get(
    '/:sn/energy',
    {
      schema: {
        tags: ['Devices'],
        summary: 'Energia do dispositivo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sn'],
          properties: { sn: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeviceSnParams }>, reply: FastifyReply) => {
      const user = request.user as { sub: number };
      const { sn } = request.params;

      try {
        const result = await tryMinThenSph(user.sub, 'energy', { device_sn: sn });
        return reply.send(result);
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error - device energy');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // GET /api/devices/:sn/energy/history — Histórico de energia do dispositivo
  fastify.get(
    '/:sn/energy/history',
    {
      schema: {
        tags: ['Devices'],
        summary: 'Histórico de energia do dispositivo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sn'],
          properties: { sn: { type: 'string' } },
        },
        querystring: {
          type: 'object',
          properties: {
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            timezone: { type: 'string' },
            page: { type: 'string' },
            limit: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: DeviceSnParams; Querystring: DeviceEnergyHistoryQuery }>,
      reply: FastifyReply,
    ) => {
      const user = request.user as { sub: number };
      const { sn } = request.params;
      const { start_date, end_date, timezone, page, limit } = request.query;

      const params: Record<string, string> = { device_sn: sn };
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;
      if (timezone) params.timezone = timezone;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      try {
        const result = await tryMinThenSph(user.sub, 'energy/history', params);
        return reply.send(result);
      } catch (error) {
        if (error instanceof GrowattServiceError) {
          request.log.error({ err: error }, 'Growatt API error - device energy history');
          return reply.status(502).send({ error: error.message });
        }
        throw error;
      }
    },
  );
}
