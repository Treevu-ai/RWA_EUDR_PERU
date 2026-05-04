/**
 * Valida las variables de entorno al arrancar el servidor.
 * Emite warnings pero no falla en arranque para no romper deploys existentes.
 */
export function validateEnv() {
  const warnings = [];

  if (process.env.PORT !== undefined) {
    const port = parseInt(process.env.PORT, 10);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      warnings.push(`PORT="${process.env.PORT}" no es un puerto válido (1-65535); se usará 3000.`);
    }
  }

  if (process.env.SESSION_TTL_HOURS !== undefined) {
    const ttl = parseInt(process.env.SESSION_TTL_HOURS, 10);
    if (!Number.isFinite(ttl) || ttl <= 0) {
      warnings.push(`SESSION_TTL_HOURS="${process.env.SESSION_TTL_HOURS}" no es un número positivo válido; se usará 8h.`);
    }
  }

  if (process.env.ALLOWED_ORIGIN !== undefined && !process.env.ALLOWED_ORIGIN.trim()) {
    warnings.push('ALLOWED_ORIGIN está vacío; todas las peticiones de origen cruzado serán rechazadas por CORS.');
  }

  for (const w of warnings) {
    console.warn(`[env] ⚠️  ${w}`);
  }

  return { warnings };
}
