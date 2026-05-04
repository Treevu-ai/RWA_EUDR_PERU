import { Router } from 'express';
import fs from 'fs';
import { cache } from '../services/apify-services.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { DATA_DIR } from '../lib/db.js';

const router = Router();

router.post('/clear', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  cache.clear();
  res.json({ success: true });
});

router.get('/status', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
    : [];
  res.json({ files });
});

export default router;
