import { Router } from 'express';
import { producerRepo, lotRepo, traceRepo, blockchainSvc, marketStats } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { getServiceStatus, executeService, COMPLIANCE_WEIGHTS } from '../services/apify-services.js';

const router = Router();

router.get('/data', authMiddleware, (_req, res) => {
  res.json({
    producers: producerRepo.all(),
    lots: lotRepo.all(),
    traceCount: traceRepo.length,
    marketStats,
    blockchainInfo: {
      height: blockchainSvc.length,
      lastHash: blockchainSvc.lastBlock?.hash
    }
  });
});

router.get('/services/status', authMiddleware, async (_req, res) => {
  try {
    const status = await getServiceStatus();
    res.json({ status, weights: COMPLIANCE_WEIGHTS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/services/:serviceName', authMiddleware, async (req, res) => {
  const { serviceName } = req.params;
  const lat = req.query.lat != null ? parseFloat(req.query.lat) : undefined;
  const lon = req.query.lon != null ? parseFloat(req.query.lon) : undefined;
  const params = { ...req.query };
  delete params.lat;
  delete params.lon;
  if (lat != null && !Number.isNaN(lat)) params.lat = lat;
  if (lon != null && !Number.isNaN(lon)) params.lon = lon;
  try {
    const result = await executeService(serviceName, params);
    if (result?.error) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
