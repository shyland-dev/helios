// Encriptação/decriptação AES-256-GCM para o token Growatt
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encripta texto usando AES-256-GCM.
 * Formato de saída: iv:authTag:ciphertext (tudo em hex)
 */
export function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');

  if (key.length !== 32) {
    throw new Error('[crypto] HELIOS_ENCRYPTION_KEY deve ter 32 bytes (64 caracteres hex)');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decripta texto encriptado com AES-256-GCM.
 * Formato esperado: iv:authTag:ciphertext (tudo em hex)
 */
export function decrypt(encryptedData: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');

  if (key.length !== 32) {
    throw new Error('[crypto] HELIOS_ENCRYPTION_KEY deve ter 32 bytes (64 caracteres hex)');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('[crypto] Formato de dados encriptados inválido');
  }

  const [ivHex, authTagHex, ciphertext] = parts as [string, string, string];
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
