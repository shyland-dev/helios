#!/usr/bin/env node
// Helios CLI — Gerenciamento administrativo via linha de comando
// Acessa o SQLite diretamente (sem passar pela API)

import '../src/env.js';
import { Command } from 'commander';
import { registerUserCommands } from './commands/user.js';
import { registerInviteCommands } from './commands/invite.js';
import { registerSessionCommands } from './commands/session.js';

const program = new Command();

program
  .name('helios')
  .description('CLI de administração do Helios')
  .version('0.0.1');

registerUserCommands(program);
registerInviteCommands(program);
registerSessionCommands(program);

program.parse();
