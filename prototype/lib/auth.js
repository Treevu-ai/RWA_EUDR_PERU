import crypto from 'crypto';
import { hashData } from '../services/apify-services.js';

// scrypt incorpora una sal aleatoria por usuario.
// Sin sal, dos usuarios con la misma contraseña tendrían el mismo hash — fácilmente descifrable.
const SCRYPT_KEYLEN = 32;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTS).toString('hex');
  return `${salt}:${hash}`;
}

/** Verifica una contraseña contra el hash almacenado.
 *  Soporta migración automática desde el formato antiguo (SHA-256 sin sal). */
export function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.includes(':')) {
    // Formato antiguo (SHA-256 corto, sin sal) — solo se usa durante la migración.
    return stored === hashData(password);
  }
  const [salt, hash] = stored.split(':');
  if (!salt || !hash || hash.length !== SCRYPT_KEYLEN * 2) return false;
  try {
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTS).toString('hex');
    // timingSafeEqual evita ataques de temporización (timing attacks)
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}
