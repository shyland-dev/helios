// Comandos: helios user list | create | delete
import { Command } from 'commander';
import bcrypt from 'bcrypt';
import { openDb } from '../db.js';
import { encrypt } from '../../src/utils/crypto.js';

interface UserRow {
  id: number;
  username: string;
  growatt_token_enc: string | null;
  created_at: string;
  updated_at: string;
}

const SALT_ROUNDS = 12;

export function registerUserCommands(program: Command) {
  const user = program.command('user').description('Gerenciamento de usuários');

  // helios user list
  user
    .command('list')
    .description('Lista todos os usuários')
    .action(() => {
      const db = openDb();
      const users = db
        .prepare('SELECT id, username, growatt_token_enc, created_at, updated_at FROM users ORDER BY id')
        .all() as UserRow[];

      if (users.length === 0) {
        console.log('Nenhum usuário cadastrado.');
        return;
      }

      console.log('\n┌─────┬──────────────────┬─────────────────┬─────────────────────┐');
      console.log('│ ID  │ Username         │ Token Growatt   │ Criado em           │');
      console.log('├─────┼──────────────────┼─────────────────┼─────────────────────┤');

      for (const u of users) {
        const id = String(u.id).padEnd(3);
        const username = u.username.padEnd(16);
        const token = u.growatt_token_enc ? '✓ configurado' : '✗ ausente';
        const tokenPad = token.padEnd(15);
        const date = u.created_at.slice(0, 16);
        console.log(`│ ${id} │ ${username} │ ${tokenPad} │ ${date}   │`);
      }

      console.log('└─────┴──────────────────┴─────────────────┴─────────────────────┘');
      console.log(`\nTotal: ${users.length} usuário(s)\n`);
      db.close();
    });

  // helios user create
  user
    .command('create')
    .description('Cria um novo usuário (sem invite code)')
    .requiredOption('-u, --username <username>', 'Nome de usuário')
    .requiredOption('-p, --password <password>', 'Senha')
    .option('-t, --token <token>', 'Token Growatt (será encriptado)')
    .action(async (opts: { username: string; password: string; token?: string }) => {
      const db = openDb();

      // Verificar se já existe
      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(opts.username);
      if (existing) {
        console.error(`✗ Erro: Usuário "${opts.username}" já existe.`);
        db.close();
        process.exit(1);
      }

      const passwordHash = await bcrypt.hash(opts.password, SALT_ROUNDS);

      let growattTokenEnc: string | null = null;
      if (opts.token) {
        const encKey = process.env.HELIOS_ENCRYPTION_KEY;
        if (!encKey) {
          console.error('✗ Erro: HELIOS_ENCRYPTION_KEY não definida. Necessária para encriptar o token.');
          db.close();
          process.exit(1);
        }
        growattTokenEnc = encrypt(opts.token, encKey);
      }

      db.prepare('INSERT INTO users (username, password_hash, growatt_token_enc) VALUES (?, ?, ?)').run(
        opts.username,
        passwordHash,
        growattTokenEnc,
      );

      console.log(`✓ Usuário "${opts.username}" criado com sucesso.`);
      if (growattTokenEnc) console.log('  Token Growatt encriptado e salvo.');
      db.close();
    });

  // helios user delete
  user
    .command('delete <username>')
    .description('Remove um usuário')
    .action((username: string) => {
      const db = openDb();

      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as
        | { id: number }
        | undefined;
      if (!existing) {
        console.error(`✗ Erro: Usuário "${username}" não encontrado.`);
        db.close();
        process.exit(1);
      }

      // Revogar sessões do usuário antes de deletar
      db.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL").run(
        existing.id,
      );

      db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);

      console.log(`✓ Usuário "${username}" removido com sucesso.`);
      console.log('  Todas as sessões foram revogadas.');
      db.close();
    });
}
