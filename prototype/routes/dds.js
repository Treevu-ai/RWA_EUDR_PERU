import { Router } from 'express';
import { lotRepo, complianceRepo, ddsRepo, blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { buildDds } from '../lib/dds.js';

const router = Router();

router.post('/due-diligence/:lotId', authMiddleware, (req, res) => {
  const lot = lotRepo.findById(req.params.lotId);
  if (!lot) return res.status(404).json({ error: 'Lote no encontrado' });

  const latestReport = complianceRepo
    .filter((r) => r.lotId === lot.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;

  const dds = buildDds({
    lot,
    latestReport,
    operator: req.body?.operator || req.user.username
  });

  ddsRepo.push(dds);
  ddsRepo.trim(200);
  blockchainSvc.addBlock({ type: 'dds_generated', ddsId: dds.id, lotId: lot.id, ddsHash: dds.hash });
  res.json({ dds });
});

router.get('/due-diligence', authMiddleware, (req, res) => {
  const { lotId } = req.query;
  const filtered = lotId ? ddsRepo.filter((d) => d.lotId === lotId) : ddsRepo.all();
  res.json({ ddsReports: filtered.slice(-50).reverse() });
});

router.get('/due-diligence/:id', authMiddleware, (req, res) => {
  const dds = ddsRepo.findById(req.params.id);
  if (!dds) return res.status(404).json({ error: 'No encontrado' });
  res.json({ dds });
});

export default router;
