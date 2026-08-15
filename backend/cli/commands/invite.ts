// Comandos: helios invite create | list
import { Command } from 'commander';
import { randomUUID } from 'node:crypto';
import { openDb } from '../db.js';

interface InviteRow {
  id: number;
  code: string;
  created_by: number;
  used_by: number | null;
  created_at: string;
  used_at: string | null;
}

interface UserRow {
  id: number;
  username: string;
}

export function registerInviteCommands(program: Command) {
  const invite = program.command('invite').description('Gerenciamento de convites');

  // helios invite create
  invite
    .command('create')
    .description('Gera um novo código de convite')
    .option('--user-id <id>', 'ID do admin que cria (default: 1)', '1')
    .action((opts: { userId: string }) => {
      const db = openDb();
      const createdBy = parseInt(opts.userId, 10);

      // Verificar se o usuário existe
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(createdBy) as UserRow | undefined;
      if (!user) {
        console.error(`✗ Erro: Usuário com ID ${createdBy} não encontrado.`);
        console.error('  Crie um usuário primeiro: helios user create');
        db.close();
        process.exit(1);
      }

      const code = randomUUID();
      db.prepare('INSERT INTO invite_codes (code, created_by) VALUES (?, ?)').run(code, createdBy);

      console.log('\n✓ Código de convite gerado:\n');
      console.log(`  ${code}`);
      console.log('\n  Compartilhe este código com o novo usuário.');
      console.log('  Ele será consumido no primeiro registro.\n');
      db.close();
    });

  // helios invite list
  invite
    .command('list')
    .description('Lista códigos de convite')
    .option('--all', 'Mostrar todos (incluindo utilizados)', false)
    .action((opts: { all: boolean }) => {
      const db = openDb();

      const query = opts.all
        ? 'SELECT * FROM invite_codes ORDER BY created_at DESC'
        : 'SELECT * FROM invite_codes WHERE used_by IS NULL ORDER BY created_at DESC';

      const invites = db.prepare(query).all() as InviteRow[];

      if (invites.length === 0) {
        console.log(opts.all ? 'Nenhum convite registrado.' : 'Nenhum convite pendente.');
        db.close();
        return;
      }

      console.log(`\n${opts.all ? 'Todos os convites' : 'Convites pendentes'}:\n`);
      console.log('┌─────┬──────────────────────────────────────┬──────────┬─────────────────────┐');
      console.log('│ ID  │ Código                               │ Status   │ Criado em           │');
      console.log('├─────┼──────────────────────────────────────┼──────────┼─────────────────────┤');

      for (const inv of invites) {
        const id = String(inv.id).padEnd(3);
        const code = inv.code;
        const status = inv.used_by ? '✓ usado ' : '○ livre ';
        const date = inv.created_at.slice(0, 16);
        console.log(`│ ${id} │ ${code} │ ${status} │ ${date}   │`);
      }

      console.log('└─────┴──────────────────────────────────────┴──────────┴─────────────────────┘');
      console.log(`\nTotal: ${invites.length}\n`);
      db.close();
    });
}
