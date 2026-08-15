import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';

export interface InviteCode {
  id: number;
  code: string;
  created_by: number;
  used_by: number | null;
  created_at: string;
  used_at: string | null;
}

export class InviteCodeService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Gerar novo código de convite
  create(createdBy: number): InviteCode {
    const code = randomUUID();
    const stmt = this.db.prepare(
      'INSERT INTO invite_codes (code, created_by) VALUES (?, ?)',
    );
    const result = stmt.run(code, createdBy);

    return this.db.prepare('SELECT * FROM invite_codes WHERE id = ?').get(result.lastInsertRowid) as InviteCode;
  }

  // Validar e consumir um código de convite
  consume(code: string, usedBy: number): boolean {
    const invite = this.db
      .prepare('SELECT * FROM invite_codes WHERE code = ? AND used_by IS NULL')
      .get(code) as InviteCode | undefined;

    if (!invite) return false;

    this.db
      .prepare("UPDATE invite_codes SET used_by = ?, used_at = datetime('now') WHERE id = ?")
      .run(usedBy, invite.id);

    return true;
  }

  // Verificar se um código é válido (disponível)
  isValid(code: string): boolean {
    const invite = this.db
      .prepare('SELECT id FROM invite_codes WHERE code = ? AND used_by IS NULL')
      .get(code) as { id: number } | undefined;

    return !!invite;
  }

  // Listar todos os convites (para CLI admin)
  listAll(): InviteCode[] {
    return this.db.prepare('SELECT * FROM invite_codes ORDER BY created_at DESC').all() as InviteCode[];
  }

  // Listar convites pendentes (não utilizados)
  listPending(): InviteCode[] {
    return this.db
      .prepare('SELECT * FROM invite_codes WHERE used_by IS NULL ORDER BY created_at DESC')
      .all() as InviteCode[];
  }
}
