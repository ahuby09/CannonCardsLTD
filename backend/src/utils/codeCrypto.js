import crypto from 'crypto';
import { env, requireConfig } from '../config/env.js';

function key() {
  return crypto
    .createHash('sha256')
    .update(requireConfig(env.codeEncryptionKey, 'CODE_ENCRYPTION_KEY'))
    .digest();
}

export function normalizeCodeValue(value) {
  return String(value || '').trim().toUpperCase();
}

export function hashCodeValue(value) {
  return crypto
    .createHash('sha256')
    .update(normalizeCodeValue(value))
    .digest('hex');
}

export function encryptCodeValue(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(normalizeCodeValue(value), 'utf8'),
    cipher.final()
  ]);

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64')
  };
}

export function decryptCodeValue({ ciphertext, iv, authTag }) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final()
  ]).toString('utf8');
}
