import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { complianceRepo, lotRepo } from '../lib/db.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'compliance-report.html');

const router = Router();

// Función de escape XSS: convierte caracteres especiales HTML en su versión segura.
function esc(val) {
  if (val == null) return 'N/A';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generatePDFHTML(report, lot) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const ts = new Date(report.timestamp);
  const statusClass = esc(report.status.toLowerCase().replace('_', '-'));
  const weight = lot?.weightKg != null ? `${lot.weightKg} kg` : null;

  return template
    .replace(/\{\{LOT_ID\}\}/g,       esc(report.lotId))
    .replace(/\{\{PRODUCT\}\}/g,      esc(lot?.product))
    .replace(/\{\{PRODUCER\}\}/g,     esc(lot?.producer))
    .replace(/\{\{DATE\}\}/g,         ts.toLocaleDateString('es-ES'))
    .replace(/\{\{TIME\}\}/g,         ts.toLocaleTimeString('es-ES'))
    .replace(/\{\{STATUS_CLASS\}\}/g, statusClass)
    .replace(/\{\{SCORE\}\}/g,        esc(report.weightedScore))
    .replace(/\{\{STATUS\}\}/g,       esc(report.status))
    .replace(/\{\{PARCEL\}\}/g,       esc(lot?.parcel))
    .replace(/\{\{WEIGHT\}\}/g,       esc(weight))
    .replace(/\{\{DESTINATION\}\}/g,  esc(lot?.destination))
    .replace(/\{\{CERTIFICATION\}\}/g, esc(lot?.certification))
    .replace(/\{\{EUDR_STATUS\}\}/g,  esc(lot?.eudr))
    .replace(/\{\{BLOCK_HASH\}\}/g,   esc(report.blockHash))
    .replace(/\{\{REPORT_HASH\}\}/g,  esc(report.hash))
    .replace(/\{\{GENERATED_AT\}\}/g, new Date().toLocaleString('es-ES'));
}

router.get('/compliance/:id', authMiddleware, (req, res) => {
  const report = complianceRepo.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'No encontrado' });
  const lot = lotRepo.findById(report.lotId);
  const html = generatePDFHTML(report, lot);
  res.json({ html, report, lot });
});

export default router;
