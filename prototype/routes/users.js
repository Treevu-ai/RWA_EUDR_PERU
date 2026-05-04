import { Router } from 'express';
import { userRepo } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  res.json({
    users: userRepo.all().map((u) => ({ id: u.id, username: u.username, name: u.name, role: u.role }))
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = userRepo.findIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  userRepo.removeAt(idx);
  res.json({ success: true });
});

export default router;
