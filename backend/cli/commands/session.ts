// Comandos: helios session list | revoke | revoke-all
import { Command } from 'commander';
import { openDb } from '../db.js';

interface SessionRow {
  id: number;
  user_id: number;
  jti: string;
  created_at: string;
  revoked_at: string | null;
  username: string;
}

export function registerSessionCommands(program: Command) {
  const session = program.command('session').description('Gerenciamento de sessões');

  // helios session list
  session
    .command('list')
    .description('Lista sessões ativas')
    .option('--all', 'Mostrar todas (incluindo revogadas)', false)
    .action((opts: { all: boolean }) => {
      const db = openDb();

      const query = opts.all
        ? `SELECT s.*, u.username FROM sessions s
           JOIN users u ON s.user_id = u.id
           ORDER BY s.created_at DESC`
        : `SELECT s.*, u.username FROM sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.revoked_at IS NULL
           ORDER BY s.created_at DESC`;

      const sessions = db.prepare(query).all() as SessionRow[];

      if (sessions.length === 0) {
        console.log(opts.all ? 'Nenhuma sessão registrada.' : 'Nenhuma sessão ativa.');
        db.close();
        return;
      }

      console.log(`\n${opts.all ? 'Todas as sessões' : 'Sessões ativas'}:\n`);
      console.log('┌─────┬──────────────────┬──────────┬─────────────────────┬──────────────────────────────────────┐');
      console.log('│ ID  │ Username         │ Status   │ Criada em           │ JTI                                  │');
      console.log('├─────┼──────────────────┼──────────┼─────────────────────┼──────────────────────────────────────┤');

      for (const s of sessions) {
        const id = String(s.id).padEnd(3);
        const username = s.username.padEnd(16);
        const status = s.revoked_at ? '✗ revog.' : '✓ ativa ';
        const date = s.created_at.slice(0, 16);
        const jti = s.jti;
        console.log(`│ ${id} │ ${username} │ ${status} │ ${date}   │ ${jti} │`);
      }

      console.log('└─────┴──────────────────┴──────────┴─────────────────────┴──────────────────────────────────────┘');
      console.log(`\nTotal: ${sessions.length}\n`);
      db.close();
    });

  // helios session revoke <username>
  session
    .command('revoke <username>')
    .description('Revoga todas as sessões de um usuário')
    .action((username: string) => {
      const db = openDb();

      const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
      if (!user) {
        console.error(`✗ Erro: Usuário "${username}" não encontrado.`);
        db.close();
        process.exit(1);
      }

      const result = db
        .prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL")
        .run(user.id);

      if (result.changes === 0) {
        console.log(`Nenhuma sessão ativa encontrada para "${username}".`);
      } else {
        console.log(`✓ ${result.changes} sessão(ões) de "${username}" revogada(s).`);
      }
      db.close();
    });

  // helios session revoke-all
  session
    .command('revoke-all')
    .description('Revoga TODAS as sessões ativas')
    .action(() => {
      const db = openDb();

      const result = db
        .prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE revoked_at IS NULL")
        .run();

      if (result.changes === 0) {
        console.log('Nenhuma sessão ativa encontrada.');
      } else {
        console.log(`✓ ${result.changes} sessão(ões) revogada(s).`);
      }
      db.close();
    });
}
