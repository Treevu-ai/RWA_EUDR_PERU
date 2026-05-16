import { Router } from 'express';
import { complianceRepo, alertRepo, blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { buildComplianceReport } from '../lib/compliance.js';

const router = Router();

router.post('/check', authMiddleware, async (req, res) => {
  try {
    const { lotId, parcelId, producer, region, product, lat, lon } = req.body;
    const { report, newAlerts } = await buildComplianceReport(
      { lotId, parcelId, producer, region, product, lat, lon },
      blockchainSvc.addBlock.bind(blockchainSvc)
    );

    complianceRepo.push(report);
    complianceRepo.trim(100);

    if (newAlerts.length) {
      const merged = [...newAlerts, ...alertRepo.all()].slice(0, 50);
      alertRepo.replace(merged);
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', authMiddleware, (_req, res) => {
  res.json({ reports: complianceRepo.slice(-50).reverse() });
});

router.get('/summary', authMiddleware, (_req, res) => {
  const all = complianceRepo.all();
  const summary = {
    total: all.length,
    compliant:    all.filter((r) => r.status === 'COMPLIANT').length,
    partial:      all.filter((r) => r.status === 'PARTIAL').length,
    nonCompliant: all.filter((r) => r.status === 'NON_COMPLIANT').length,
    avgScore: all.length
      ? Math.round(all.reduce((s, r) => s + r.weightedScore, 0) / all.length)
      : 85
  };
  res.json({ summary });
});

router.get('/report/:id', authMiddleware, (req, res) => {
  const report = complianceRepo.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'No encontrado' });
  res.json({ report });
});

export default router;
