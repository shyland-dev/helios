import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const envPath = join(rootDir, '.env');
const envPathMonorepo = join(rootDir, '..', '.env');
const environmentTsPath = join(rootDir, 'src', 'lib', 'environments', 'environment.ts');

// Template limpo (sem token) para restaurar ao finalizar
const cleanEnvironment = `export const environment = {
  production: false,
  // Em dev, usa proxy local para o backend Helios
  apiBaseUrl: '/api/',
  apiToken: '',
};
`;

/**
 * Carrega variáveis do arquivo .env, gera o environment.ts com o token,
 * executa o comando passado como argumento, e restaura o environment.ts ao finalizar.
 *
 * Uso: node scripts/load-env.mjs [argumentos...]
 */
async function loadEnvAndRun() {
  // Carregar .env se existir (local ou raiz do monorepo)
  const resolvedEnvPath = existsSync(envPath) ? envPath : existsSync(envPathMonorepo) ? envPathMonorepo : null;

  if (resolvedEnvPath) {
    const content = await readFile(resolvedEnvPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Ignorar linhas vazias e comentários
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Remover aspas do valor
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }

    console.log(`[load-env] Variáveis de ambiente carregadas de ${resolvedEnvPath}`);
  } else {
    console.warn('[load-env] Arquivo .env não encontrado — usando variáveis do sistema.');
  }

  // Resolver o token (prioridade: .env > variável de sistema)
  const apiToken = process.env.GROWATT_API_TOKEN ?? '';

  // Gerar environment.ts com o token injetado
  const environmentContent = `export const environment = {
  production: false,
  // Em dev, usa proxy local para o backend Helios
  apiBaseUrl: '/api/',
  apiToken: '${apiToken}',
};
`;

  await mkdir(dirname(environmentTsPath), { recursive: true });
  await writeFile(environmentTsPath, environmentContent, 'utf8');
  console.log(`[load-env] environment.ts gerado com token ${apiToken ? '(configurado)' : '(vazio)'}`);

  // Restaurar environment.ts ao finalizar (qualquer sinal de saída)
  async function restore() {
    await writeFile(environmentTsPath, cleanEnvironment, 'utf8');
    console.log('[load-env] environment.ts restaurado (token removido)');
  }

  // Executar o comando recebido como argumento
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('[load-env] Nenhum comando especificado.');
    process.exit(1);
  }

  const command = args.join(' ');
  const child = spawn(command, {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  child.on('close', async (code) => {
    await restore();
    process.exit(code ?? 0);
  });

  child.on('error', async (err) => {
    console.error('[load-env] Erro ao executar comando:', err.message);
    await restore();
    process.exit(1);
  });

  // Capturar sinais de interrupção (Ctrl+C, kill, etc.)
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, async () => {
      child.kill(signal);
      await restore();
      process.exit(0);
    });
  }
}

loadEnvAndRun();
