import { Router } from 'express';
import { blockchainSvc, systemStats, systemConfig } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

// ── System stats ─────────────────────────────────────────────────────────────
router.get('/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  systemStats.lastUpdate = new Date().toISOString();
  res.json({ stats: { ...systemStats, blocks: blockchainSvc.length } });
});

// ── System config ─────────────────────────────────────────────────────────────
router.post('/config', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  // Solo se aceptan los campos conocidos para evitar que se inyecten propiedades arbitrarias.
  const { threshold, email, timezone } = req.body;
  if (threshold !== undefined) systemConfig.threshold = Number(threshold);
  if (email     !== undefined) systemConfig.email = Boolean(email);
  if (timezone  !== undefined && typeof timezone === 'string') systemConfig.timezone = timezone;
  res.json({ success: true, config: { ...systemConfig } });
});

export default router;
