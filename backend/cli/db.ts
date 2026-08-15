// Helper para abrir conexão com o banco SQLite na CLI
import Database from 'better-sqlite3';

export function openDb(): Database.Database {
  const dbPath = process.env.HELIOS_DB_PATH ?? './data/helios.db';
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}
