// Service de comunicação com a Growatt Open API V1
// Implementa cache inteligente: TTL 5min, fallback para cache expirado em caso de erro

import type Database from 'better-sqlite3';
import { CacheService } from './cache.service.js';
import { decrypt } from '../utils/crypto.js';

// Código de erro Growatt: frequência de consulta excedida
const GROWATT_FREQUENCY_LIMIT_CODE = 10012;

export interface GrowattApiResponse<T = unknown> {
  error_code: number;
  error_msg: string;
  data: T;
}

export class GrowattService {
  private baseUrl: string;
  private cache: CacheService;
  private encryptionKey: string;
  private db: Database.Database;

  constructor(opts: { baseUrl: string; cacheTtlMs: number; encryptionKey: string; db: Database.Database }) {
    this.baseUrl = opts.baseUrl;
    this.encryptionKey = opts.encryptionKey;
    this.db = opts.db;
    this.cache = new CacheService(opts.db, opts.cacheTtlMs);
  }

  // Decripta o token Growatt do usuário armazenado no banco
  private getUserToken(userId: number): string {
    const row = this.db.prepare('SELECT growatt_token_enc FROM users WHERE id = ?').get(userId) as
      | { growatt_token_enc: string | null }
      | undefined;

    if (!row?.growatt_token_enc) {
      throw new GrowattServiceError('Token Growatt não configurado para este usuário', 'NO_TOKEN');
    }

    return decrypt(row.growatt_token_enc, this.encryptionKey);
  }

  // Faz request à Growatt API com token do usuário
  private async fetchFromGrowatt<T>(
    token: string,
    endpoint: string,
    params: Record<string, string>,
  ): Promise<GrowattApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        token: token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new GrowattServiceError(`Growatt API retornou HTTP ${response.status}`, 'HTTP_ERROR');
    }

    // A Growatt pode retornar JSON com content-type text/html — tentar parsear sempre
    const text = await response.text();
    try {
      return JSON.parse(text) as GrowattApiResponse<T>;
    } catch {
      throw new GrowattServiceError(
        `Growatt API retornou resposta inválida (não é JSON): ${text.slice(0, 200)}`,
        'INVALID_RESPONSE',
      );
    }
  }

  /**
   * Request com cache inteligente:
   * 1. Se cache válido (< TTL) → retorna cache
   * 2. Se cache expirado → tenta buscar na Growatt
   *    - Se Growatt OK → salva no cache e retorna
   *    - Se Growatt erro de frequência (10012) → retorna cache expirado
   *    - Se Growatt outro erro → lança erro
   * 3. Se sem cache → busca na Growatt obrigatoriamente
   */
  async request<T>(userId: number, endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Verificar cache
    const cached = this.cache.get<T>(userId, endpoint, params);

    if (cached && !cached.expired) {
      return cached.data;
    }

    // Buscar token do usuário
    const token = this.getUserToken(userId);

    try {
      const response = await this.fetchFromGrowatt<T>(token, endpoint, params);

      if (response.error_code !== 0) {
        // Se é erro de frequência e temos cache expirado, usar o cache
        if (response.error_code === GROWATT_FREQUENCY_LIMIT_CODE && cached) {
          return cached.data;
        }
        throw new GrowattServiceError(
          `[Growatt Error ${response.error_code}] ${response.error_msg}`,
          'API_ERROR',
          response.error_code,
        );
      }

      // Salvar no cache e retornar
      this.cache.set(userId, endpoint, params, response.data);
      return response.data;
    } catch (error) {
      // Se temos cache expirado e o erro é de rede/timeout, usar fallback
      if (cached && !(error instanceof GrowattServiceError && error.code === 'API_ERROR')) {
        return cached.data;
      }
      throw error;
    }
  }

  // Limpar cache do usuário
  clearUserCache(userId: number): void {
    this.cache.clearUser(userId);
  }
}

export class GrowattServiceError extends Error {
  readonly code: string;
  readonly growattErrorCode?: number;

  constructor(message: string, code: string, growattErrorCode?: number) {
    super(message);
    this.name = 'GrowattServiceError';
    this.code = code;
    this.growattErrorCode = growattErrorCode;
  }
}
