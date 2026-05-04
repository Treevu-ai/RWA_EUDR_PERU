import { sessionRepo } from './db.js';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessionRepo.findOne((s) => s.token === token);
  if (!session) return res.status(401).json({ error: 'No autorizado' });
  if (session.expiresAt && Date.now() >= new Date(session.expiresAt).getTime()) {
    sessionRepo.replace(sessionRepo.filter((s) => s.token !== token));
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  req.user = session;
  next();
}
