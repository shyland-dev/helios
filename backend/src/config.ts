// Configuração centralizada do Helios API — carrega variáveis de ambiente

export interface AppConfig {
  jwt: {
    secret: string;
  };
  encryption: {
    key: string;
  };
  db: {
    path: string;
  };
  api: {
    port: number;
    host: string;
  };
  frontend: {
    url: string;
  };
  rateLimit: {
    max: number;
    windowMs: number;
  };
  growatt: {
    baseUrl: string;
    cacheTtlMs: number;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[config] Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export function loadConfig(): AppConfig {
  return {
    jwt: {
      secret: requireEnv('HELIOS_JWT_SECRET'),
    },
    encryption: {
      key: requireEnv('HELIOS_ENCRYPTION_KEY'),
    },
    db: {
      path: optionalEnv('HELIOS_DB_PATH', './data/helios.db'),
    },
    api: {
      port: parseInt(optionalEnv('HELIOS_API_PORT', '3000'), 10),
      host: optionalEnv('HELIOS_API_HOST', '0.0.0.0'),
    },
    frontend: {
      url: optionalEnv('HELIOS_FRONTEND_URL', 'http://localhost:4200'),
    },
    rateLimit: {
      max: parseInt(optionalEnv('HELIOS_RATE_LIMIT_MAX', '100'), 10),
      windowMs: parseInt(optionalEnv('HELIOS_RATE_LIMIT_WINDOW_MS', '60000'), 10),
    },
    growatt: {
      baseUrl: optionalEnv('HELIOS_GROWATT_BASE_URL', 'https://openapi.growatt.com/v1'),
      cacheTtlMs: parseInt(optionalEnv('HELIOS_CACHE_TTL_MS', '300000'), 10),
    },
  };
}
