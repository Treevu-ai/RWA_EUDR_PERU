import { Router } from 'express';
import { lotRepo, blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { validateString, validatePositiveNumber, generateId } from '../lib/validators.js';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({ lots: lotRepo.all() });
});

router.post('/', authMiddleware, (req, res) => {
  const { producer, product, parcel, eudr, status, weightKg, destination, pricePerKg, certification, lat, lon } = req.body;
  const errs = [
    validateString(producer, 'producer'),
    validateString(product, 'product'),
    weightKg != null ? validatePositiveNumber(weightKg, 'weightKg') : null,
    destination != null ? validateString(destination, 'destination') : null
  ].filter(Boolean);
  if (errs.length) return res.status(400).json({ errors: errs });

  const lot = {
    id: generateId(product?.substring(0, 3) || 'LOT'),
    producer, product, parcel,
    eudr: eudr || 'Pendiente',
    status: status || 'Registrado',
    weightKg, destination, pricePerKg, certification, lat, lon,
    createdAt: new Date().toISOString()
  };
  lotRepo.push(lot);
  blockchainSvc.addBlock({ type: 'lot_created', lot });
  res.json({ lot });
});

router.put('/:id', authMiddleware, (req, res) => {
  const idx = lotRepo.findIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });

  // Solo se permite modificar campos explícitos — igual que en productores.
  const { producer, product, parcel, eudr, status, weightKg, destination, pricePerKg, certification, lat, lon } = req.body;
  const allowed = {};
  if (producer !== undefined)      allowed.producer = producer;
  if (product !== undefined)       allowed.product = product;
  if (parcel !== undefined)        allowed.parcel = parcel;
  if (eudr !== undefined)          allowed.eudr = eudr;
  if (status !== undefined)        allowed.status = status;
  if (weightKg !== undefined)      allowed.weightKg = weightKg;
  if (destination !== undefined)   allowed.destination = destination;
  if (pricePerKg !== undefined)    allowed.pricePerKg = pricePerKg;
  if (certification !== undefined) allowed.certification = certification;
  if (lat !== undefined)           allowed.lat = lat;
  if (lon !== undefined)           allowed.lon = lon;

  const updated = lotRepo.updateAt(idx, allowed);
  blockchainSvc.addBlock({ type: 'lot_updated', lot: updated });
  res.json({ lot: updated });
});

router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = lotRepo.findIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  lotRepo.removeAt(idx);
  res.json({ success: true });
});

export default router;
