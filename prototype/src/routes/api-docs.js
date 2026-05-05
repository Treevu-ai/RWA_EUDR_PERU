import { Router } from "express";

export const apiDocsRouter = Router();

const docs = {
  name: "ForestTrace API",
  version: "0.5.0",
  description: "Minimal enterprise integration surface for Peru MVP.",
  endpoints: [
    {
      method: "GET",
      path: "/api/health",
      purpose: "Service health check"
    },
    {
      method: "GET",
      path: "/api/lots",
      purpose: "List lots for organization"
    },
    {
      method: "POST",
      path: "/api/lots",
      purpose: "Create lot"
    },
    {
      method: "PUT",
      path: "/api/lots/:id/link-farm",
      purpose: "Link lot to farm parcel"
    },
    {
      method: "POST",
      path: "/api/compliance/check",
      purpose: "Run EUDR risk scoring v1"
    },
    {
      method: "GET",
      path: "/api/compliance/reports",
      purpose: "List compliance records"
    },
    {
      method: "POST",
      path: "/api/reports/compliance/:complianceRecordId",
      purpose: "Generate PDF report from compliance record"
    },
    {
      method: "GET",
      path: "/api/reports/:reportId/download",
      purpose: "Download generated report"
    },
    {
      method: "POST",
      path: "/api/finance/lots/:lotId/simulate",
      purpose: "Calculate financing eligibility snapshot"
    },
    {
      method: "GET",
      path: "/api/export/lots.csv",
      purpose: "Export consolidated lots dataset"
    }
  ],
  auth: {
    requiredHeaders: ["x-org-id"],
    optionalHeaders: ["x-actor-id"]
  }
};

apiDocsRouter.get("/", (_req, res) => {
  res.json(docs);
});
