import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, "..", "..", "data", "reports");

const ensureReportsDir = () => {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
};

export const buildCompliancePdf = async ({ reportId, complianceRecord, batch }) => {
  ensureReportsDir();
  const filename = `compliance-${reportId}.pdf`;
  const fullPath = path.join(reportsDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const stream = fs.createWriteStream(fullPath);
    doc.pipe(stream);

    doc.fontSize(18).text("ForestTrace EUDR Compliance Report", { align: "left" });
    doc.moveDown(1);
    doc.fontSize(11).text(`Report ID: ${reportId}`);
    doc.text(`Generated At: ${new Date().toISOString()}`);
    doc.text(`Batch ID: ${complianceRecord.batch_id}`);
    doc.text(`Batch Code: ${batch?.code ?? "N/A"}`);
    doc.text(`Product: ${batch?.product ?? "N/A"}`);
    doc.moveDown(1);
    doc.fontSize(14).text(`Risk Status: ${complianceRecord.status}`);
    doc.fontSize(12).text(`Score: ${complianceRecord.score}`);
    doc.text(`Scoring Version: ${complianceRecord.scoring_version}`);
    doc.moveDown(1);
    doc.fontSize(10).text(
      "Based on available satellite and operational data, this report supports EUDR preparation workflows. It is not legal certification."
    );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return { fullPath, filename };
};
