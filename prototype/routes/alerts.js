import { Router } from 'express';
import { alertRepo } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const all = alertRepo.all();
  const filtered = unreadOnly ? all.filter((a) => !a.read) : all;
  res.json({
    alerts: filtered.slice(-20).reverse(),
    total: all.length,
    unread: all.filter((a) => !a.read).length
  });
});

router.post('/:id/read', authMiddleware, (req, res) => {
  const idx = alertRepo.findIndex(req.params.id);
  if (idx !== -1) alertRepo.updateAt(idx, { read: true });
  res.json({ success: idx !== -1 });
});

router.post('/read-all', authMiddleware, (_req, res) => {
  const all = alertRepo.all();
  const updated = all.map((a) => ({ ...a, read: true }));
  alertRepo.replace(updated);
  res.json({ success: true, count: all.length });
});

export default router;
