import { Router } from 'express';
import { blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({
    height: blockchainSvc.length,
    lastHash: blockchainSvc.lastBlock?.hash,
    chain: blockchainSvc.tail(40)
  });
});

router.get('/verify', authMiddleware, (_req, res) => {
  res.json(blockchainSvc.verify());
});

export default router;
