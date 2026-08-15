// Cache inteligente — TTL 5min, fallback para dados expirados em caso de erro
import { createHash } from 'node:crypto';
import type Database from 'better-sqlite3';

interface CacheRow {
  id: number;
  user_id: number;
  endpoint: string;
  params_hash: string;
  response_data: string;
  fetched_at: string;
}

export class CacheService {
  private db: Database.Database;
  private ttlMs: number;

  constructor(db: Database.Database, ttlMs: number) {
    this.db = db;
    this.ttlMs = ttlMs;
  }

  // Gera hash dos parâmetros para lookup rápido
  private hashParams(params: Record<string, string>): string {
    const sorted = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return createHash('sha256').update(sorted).digest('hex').slice(0, 16);
  }

  /**
   * Busca dados do cache.
   * Retorna { data, expired } se encontrou, ou null se não há cache.
   */
  get<T>(userId: number, endpoint: string, params: Record<string, string>): { data: T; expired: boolean } | null {
    const paramsHash = this.hashParams(params);

    const row = this.db
      .prepare('SELECT * FROM growatt_cache WHERE user_id = ? AND endpoint = ? AND params_hash = ?')
      .get(userId, endpoint, paramsHash) as CacheRow | undefined;

    if (!row) return null;

    const fetchedAt = new Date(row.fetched_at + 'Z').getTime();
    const age = Date.now() - fetchedAt;
    const expired = age >= this.ttlMs;

    try {
      const data = JSON.parse(row.response_data) as T;
      return { data, expired };
    } catch {
      return null;
    }
  }

  /**
   * Salva dados no cache (upsert — sobrescreve se já existe).
   */
  set(userId: number, endpoint: string, params: Record<string, string>, data: unknown): void {
    const paramsHash = this.hashParams(params);
    const responseData = JSON.stringify(data);

    this.db
      .prepare(
        `INSERT INTO growatt_cache (user_id, endpoint, params_hash, response_data, fetched_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT (user_id, endpoint, params_hash)
         DO UPDATE SET response_data = excluded.response_data, fetched_at = excluded.fetched_at`,
      )
      .run(userId, endpoint, paramsHash, responseData);
  }

  /**
   * Limpa cache de um usuário (todos endpoints).
   */
  clearUser(userId: number): void {
    this.db.prepare('DELETE FROM growatt_cache WHERE user_id = ?').run(userId);
  }

  /**
   * Limpa todo o cache expirado (job de limpeza).
   */
  clearExpired(): number {
    const cutoff = new Date(Date.now() - this.ttlMs).toISOString().replace('T', ' ').slice(0, 19);
    const result = this.db.prepare('DELETE FROM growatt_cache WHERE fetched_at < ?').run(cutoff);
    return result.changes;
  }
}
