/** Simple field validators; return an error string or null. */
export function validateString(val, name, { maxLen = 200 } = {}) {
  if (typeof val !== 'string' || val.trim().length === 0) return `${name} es requerido`;
  if (val.length > maxLen) return `${name} excede ${maxLen} caracteres`;
  return null;
}

export function validatePositiveNumber(val, name) {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return `${name} debe ser un número positivo`;
  return null;
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
