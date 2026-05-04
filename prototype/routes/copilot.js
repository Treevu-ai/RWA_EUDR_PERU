import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../lib/authMiddleware.js';
import { appendCopilotAudit, getCapabilities, getChecklist, getEurlexReferences, analyzeGaps, queryCopilot } from '../services/eudr-copilot.js';
import { lotRepo } from '../lib/db.js';

const router = Router();

const copilotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes al copiloto. Intente más tarde.' }
});

router.get('/capabilities', authMiddleware, (_req, res) => {
  try {
    res.json(getCapabilities());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

router.get('/checklist', authMiddleware, (_req, res) => {
  try {
    res.json(getChecklist());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

router.post('/gap-analysis', authMiddleware, (req, res) => {
  try {
    const lotId = req.body?.lotId;
    const lot = lotRepo.findById(lotId) || req.body?.lot || {};
    const out = analyzeGaps(lot);
    appendCopilotAudit({
      event: 'gap_analysis',
      user: req.user?.username,
      lotId: lot.id || lotId || null,
      checklistVersion: out.checklistVersion,
      geoPresent: out.signals?.geoPresent
    });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

router.get('/eurlex-refs', authMiddleware, (_req, res) => {
  try {
    res.json(getEurlexReferences());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

router.post('/query', authMiddleware, copilotLimiter, async (req, res) => {
  try {
    const { question, useLlm } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Campo question (string) requerido' });
    }
    const q = question.trim();
    const result = await queryCopilot(q, { useLlm: Boolean(useLlm) });
    appendCopilotAudit({
      event: 'copilot_query',
      user: req.user?.username,
      questionSha256: crypto.createHash('sha256').update(q, 'utf8').digest('hex'),
      questionLen: q.length,
      useLlm: Boolean(useLlm),
      retrievalMode: result.retrievalMode,
      mode: result.mode,
      hybridAvailable: result.hybridAvailable,
      chunkIds: (result.chunksUsed || result.chunks || []).map((c) => c.id).slice(0, 12)
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

export default router;
