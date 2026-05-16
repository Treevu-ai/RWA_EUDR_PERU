-- Migration: legality_checks table
-- Tracks EUDR Art. 2.40 compliance across the 8 legality domains per batch
-- Version: 2026-05-15

CREATE TABLE IF NOT EXISTS legality_checks (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,

  -- Domain (a): Land tenure and use rights
  legality_land_tenure TEXT,
  legality_land_tenure_status TEXT DEFAULT 'pending'
    CHECK (legality_land_tenure_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (b): Environmental protection
  legality_environment TEXT,
  legality_environment_status TEXT DEFAULT 'pending'
    CHECK (legality_environment_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (c): Third-party rights, FPIC
  legality_third_party_rights TEXT,
  legality_third_party_rights_status TEXT DEFAULT 'pending'
    CHECK (legality_third_party_rights_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (d): Labour legislation
  legality_labor TEXT,
  legality_labor_status TEXT DEFAULT 'pending'
    CHECK (legality_labor_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (e): Human rights
  legality_human_rights TEXT,
  legality_human_rights_status TEXT DEFAULT 'pending'
    CHECK (legality_human_rights_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (f): Tax legislation
  legality_tax TEXT,
  legality_tax_status TEXT DEFAULT 'pending'
    CHECK (legality_tax_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (g): Anti-corruption legislation
  legality_anticorruption TEXT,
  legality_anticorruption_status TEXT DEFAULT 'pending'
    CHECK (legality_anticorruption_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Domain (h): Trade and customs legislation
  legality_trade_customs TEXT,
  legality_trade_customs_status TEXT DEFAULT 'pending'
    CHECK (legality_trade_customs_status IN ('pending', 'evidence_collected', 'verified', 'flagged', 'exempt')),

  -- Traceability metadata
  mass_balance_verified BOOLEAN DEFAULT FALSE,
  volume_surface_audited BOOLEAN DEFAULT FALSE,
  third_party_certifications JSONB DEFAULT '[]'::jsonb,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legality_checks_org_id ON legality_checks(org_id);
CREATE INDEX IF NOT EXISTS idx_legality_checks_batch_id ON legality_checks(batch_id);
CREATE INDEX IF NOT EXISTS idx_legality_checks_review_due ON legality_checks(review_due_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_legality_checks_batch_unique ON legality_checks(org_id, batch_id);
