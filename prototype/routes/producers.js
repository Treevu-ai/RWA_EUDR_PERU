import { Router } from 'express';
import { producerRepo, blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { validateString, validatePositiveNumber, generateId } from '../lib/validators.js';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({ producers: producerRepo.all() });
});

router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const { name, region, hectares, digitalMaturity, members, lat, lon, certifications } = req.body;
  const errs = [
    validateString(name, 'name'),
    validateString(region, 'region'),
    hectares != null ? validatePositiveNumber(hectares, 'hectares') : null
  ].filter(Boolean);
  if (errs.length) return res.status(400).json({ errors: errs });

  const producer = {
    id: generateId('P'),
    name, region, hectares,
    digitalMaturity: digitalMaturity || 'Inicial',
    members: members || 1,
    lat, lon,
    certifications: certifications || [],
    status: 'Registrado',
    createdAt: new Date().toISOString()
  };
  producerRepo.push(producer);
  blockchainSvc.addBlock({ type: 'producer_created', producer });
  res.json({ producer });
});

router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = producerRepo.findIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });

  // Solo se permite modificar campos explícitos — campos internos como id y createdAt
  // no pueden ser alterados desde afuera para evitar falsificación de registros.
  const { name, region, hectares, digitalMaturity, members, lat, lon, certifications, status } = req.body;
  const allowed = {};
  if (name !== undefined)           allowed.name = name;
  if (region !== undefined)         allowed.region = region;
  if (hectares !== undefined)       allowed.hectares = hectares;
  if (digitalMaturity !== undefined) allowed.digitalMaturity = digitalMaturity;
  if (members !== undefined)        allowed.members = members;
  if (lat !== undefined)            allowed.lat = lat;
  if (lon !== undefined)            allowed.lon = lon;
  if (certifications !== undefined) allowed.certifications = certifications;
  if (status !== undefined)         allowed.status = status;

  const updated = producerRepo.updateAt(idx, allowed);
  blockchainSvc.addBlock({ type: 'producer_updated', producer: updated });
  res.json({ producer: updated });
});

router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = producerRepo.findIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  const deleted = producerRepo.removeAt(idx);
  blockchainSvc.addBlock({ type: 'producer_deleted', producerId: deleted.id });
  res.json({ success: true });
});

export default router;
