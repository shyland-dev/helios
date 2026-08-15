// Carrega variáveis de ambiente do .env (raiz do monorepo ou diretório atual)
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remover aspas do valor
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Não sobrescrever variáveis já definidas no sistema
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Procura .env em ordem: diretório atual → raiz do monorepo (../)
const cwd = process.cwd();
const localEnv = join(cwd, '.env');
const rootEnv = resolve(cwd, '..', '.env');

if (existsSync(localEnv)) {
  loadEnvFile(localEnv);
} else if (existsSync(rootEnv)) {
  loadEnvFile(rootEnv);
}
