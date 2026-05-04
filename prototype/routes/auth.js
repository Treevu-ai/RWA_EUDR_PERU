import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { userRepo, sessionRepo, SESSION_TTL_MS } from '../lib/db.js';
import { hashPassword, verifyPassword } from '../lib/auth.js';
import { validateString } from '../lib/validators.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación. Intente más tarde.' }
});

router.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const errs = [
    validateString(username, 'username', { maxLen: 100 }),
    validateString(password, 'password', { maxLen: 100 })
  ].filter(Boolean);
  if (errs.length) return res.status(400).json({ error: errs[0] });

  const user = userRepo.findOne((u) => u.username === username);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const isLegacyHash = !user.password?.includes(':');
  if (!verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  // Migración automática: si el hash era del formato antiguo (sin sal),
  // lo reemplazamos por el nuevo formato seguro tras el primer login exitoso.
  if (isLegacyHash) {
    const idx = userRepo.findIndex(user.id);
    userRepo.updateAt(idx, { password: hashPassword(password) });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  sessionRepo.push({
    token,
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: new Date().toISOString(),
    expiresAt
  });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
});

router.post('/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessionRepo.replace(sessionRepo.filter((s) => s.token !== token));
  res.json({ success: true });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
