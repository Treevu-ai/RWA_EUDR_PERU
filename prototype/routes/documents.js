import { Router } from 'express';
import { lotRepo, blockchainSvc } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = Router();

const validDocumentTypes = [
  'certificado_origen', 'certificado_calidad', 'certificado_bio',
  'factura', 'guia_remision', 'declaracion_aduana'
];
const validFormats = ['pdf', 'jpg', 'png', 'jpeg'];

router.post('/validate', authMiddleware, (req, res) => {
  const { lotId, documentType, format, fileSize } = req.body;
  const errors = [];
  if (!validDocumentTypes.includes(documentType)) errors.push(`Tipo de documento inválido: ${documentType}`);
  if (!validFormats.includes(format?.toLowerCase())) errors.push(`Formato inválido: ${format}`);
  if (!fileSize || fileSize > 10 * 1024 * 1024) errors.push('Tamaño máximo 10MB');

  const lot = lotRepo.findById(lotId);
  if (!lot) errors.push('Lote no encontrado');
  if (errors.length > 0) return res.status(400).json({ valid: false, errors });

  blockchainSvc.addBlock({ type: 'document_validated', lotId, documentType, format, validatedBy: req.user.username });
  res.json({ valid: true, message: 'Documento válido', lot: lot.id });
});

export default router;
