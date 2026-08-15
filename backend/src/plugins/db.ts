import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { FastifyInstance } from 'fastify';

export interface DbPluginOptions {
  path: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
  }
}

async function dbPluginFn(fastify: FastifyInstance, opts: DbPluginOptions) {
  // Garante que o diretório do banco existe
  mkdirSync(dirname(opts.path), { recursive: true });

  const db = new Database(opts.path);

  // Configurações de performance para SQLite
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  // Executar migrations
  runMigrations(db);

  // Decorar instância do Fastify
  fastify.decorate('db', db);

  // Fechar banco ao encerrar o servidor
  fastify.addHook('onClose', () => {
    db.close();
  });

  fastify.log.info(`[db] Banco SQLite conectado: ${opts.path}`);
}

function runMigrations(db: Database.Database) {
  // Tabela de controle de migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrations = getMigrations();
  const applied = db
    .prepare('SELECT name FROM _migrations')
    .all() as { name: string }[];
  const appliedNames = new Set(applied.map((m) => m.name));

  const insertMigration = db.prepare('INSERT INTO _migrations (name) VALUES (?)');

  for (const migration of migrations) {
    if (appliedNames.has(migration.name)) continue;

    db.exec(migration.sql);
    insertMigration.run(migration.name);
  }
}

function getMigrations() {
  return [
    {
      name: '001_create_users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          growatt_token_enc TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '002_create_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          jti TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          revoked_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `,
    },
    {
      name: '003_create_invite_codes',
      sql: `
        CREATE TABLE IF NOT EXISTS invite_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          created_by INTEGER NOT NULL,
          used_by INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          used_at TEXT,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
        );
      `,
    },
    {
      name: '004_create_growatt_cache',
      sql: `
        CREATE TABLE IF NOT EXISTS growatt_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          endpoint TEXT NOT NULL,
          params_hash TEXT NOT NULL,
          response_data TEXT NOT NULL,
          fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_growatt_cache_lookup
          ON growatt_cache (user_id, endpoint, params_hash);
      `,
    },
  ];
}

export const dbPlugin = fp(dbPluginFn, {
  name: 'helios-db',
});
