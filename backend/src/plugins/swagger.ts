import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

async function swaggerPluginFn(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Helios API',
        description: 'API do painel de monitoramento solar Helios — Growatt Open API proxy com cache inteligente',
        version: '0.0.1',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Desenvolvimento' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Autenticação e registro' },
        { name: 'Plants', description: 'Plantas (usinas solares)' },
        { name: 'Devices', description: 'Dispositivos (inversores)' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  fastify.log.info('[swagger] Documentação disponível em /docs');
}

export const swaggerPlugin = fp(swaggerPluginFn, {
  name: 'helios-swagger',
});
