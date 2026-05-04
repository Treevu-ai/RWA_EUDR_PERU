import { Router } from 'express';
import express from 'express';
import { traceRepo } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { generateId } from '../lib/validators.js';

const router = Router();

router.get('/api/traces', authMiddleware, (_req, res) => {
  res.json({
    traces: traceRepo.slice(-20).reverse(),
    metrics: { total: traceRepo.length }
  });
});

// OTLP trace receiver — no requiere auth para recibir trazas del browser
router.post('/otlp/v1/traces', express.raw({ type: '*/*', limit: '4mb' }), (req, res) => {
  const entry = {
    id: generateId('TR'),
    receivedAt: new Date().toISOString(),
    contentType: req.get('content-type'),
    rawSize: req.body.length || 0,
    status: 'received'
  };
  traceRepo.push(entry);
  if (traceRepo.length > 500) {
    // Mantener solo las últimas 500 trazas en memoria
    traceRepo.replace(traceRepo.slice(-500));
  }
  res.status(200).json({ result: 'traces received', traceId: entry.id });
});

export default router;
