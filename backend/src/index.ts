import './env.js';
import Fastify from 'fastify';

import { loadConfig } from './config.js';
import { dbPlugin } from './plugins/db.js';
import { authPlugin } from './plugins/auth.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { securityPlugin } from './plugins/security.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { authRoutes } from './routes/auth.js';
import { plantRoutes } from './routes/plants.js';
import { deviceRoutes } from './routes/devices.js';

async function main() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // Plugins (ordem importa)
  await app.register(swaggerPlugin);
  await app.register(dbPlugin, { path: config.db.path });
  await app.register(securityPlugin, {
    frontendUrl: config.frontend.url,
  });
  await app.register(rateLimitPlugin, {
    max: config.rateLimit.max,
    windowMs: config.rateLimit.windowMs,
  });
  await app.register(authPlugin, {
    jwtSecret: config.jwt.secret,
  });

  // Rotas
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(plantRoutes, { prefix: '/api/plants' });
  await app.register(deviceRoutes, { prefix: '/api/devices' });

  // Health check
  app.get('/api/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check',
    },
  }, async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Start
  try {
    await app.listen({ port: config.api.port, host: config.api.host });
    app.log.info(`Helios API rodando em http://${config.api.host}:${config.api.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
