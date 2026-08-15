import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const rootDir = process.cwd();

const paths = {
  packageJson: join(rootDir, 'package.json'),
  packageLockJson: join(rootDir, 'package-lock.json'),
  versionJson: join(rootDir, 'public', 'assets', 'version.json'),
  versionTs: join(rootDir, 'src', 'lib', 'environments', 'version.ts'),
};

async function readJson(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function assertVersion(version) {
  if (typeof version !== 'string' || version.trim() === '') {
    throw new Error('The "version" property in package.json is missing or invalid.');
  }
}

async function syncPackageLockVersion({ name, version }) {
  let lockData;

  try {
    lockData = await readJson(paths.packageLockJson);
  } catch {
    lockData = {
      name,
      version,
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          name,
          version,
        },
      },
    };
    await writeJson(paths.packageLockJson, lockData);
    return;
  }

  lockData.version = version;

  if (!lockData.packages || typeof lockData.packages !== 'object') {
    lockData.packages = {};
  }
  if (!lockData.packages[''] || typeof lockData.packages[''] !== 'object') {
    lockData.packages[''] = {};
  }

  lockData.packages[''].version = version;
  if (!lockData.packages[''].name && name) {
    lockData.packages[''].name = name;
  }

  await writeJson(paths.packageLockJson, lockData);
}

async function syncVersionFiles(version) {
  await writeJson(paths.versionJson, { version });

  await mkdir(dirname(paths.versionTs), { recursive: true });
  const tsContent = `export const APP_VERSION = '${version}';\n`;
  await writeFile(paths.versionTs, tsContent, 'utf8');
}

async function main() {
  const pkg = await readJson(paths.packageJson);
  const version = pkg.version;

  assertVersion(version);

  await syncPackageLockVersion({ name: pkg.name, version });
  await syncVersionFiles(version);

  const lifecycle = process.env.npm_lifecycle_event ?? 'manual';
  console.log(`[sync-version] (${lifecycle}) version synchronized: ${version}`);
}

main().catch((error) => {
  console.error('[sync-version] Failed to synchronize version.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
