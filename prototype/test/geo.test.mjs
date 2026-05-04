import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCoordinate, buildGeoEvidence } from '../lib/geo.js';

test('normalizeCoordinate returns null for non-numeric values', () => {
  assert.equal(normalizeCoordinate('not-a-number'), null);
  assert.equal(normalizeCoordinate(undefined), null);
  assert.equal(normalizeCoordinate(NaN), null);
});

test('normalizeCoordinate converts null to 0 (JavaScript Number(null) === 0)', () => {
  // Number(null) === 0, which is a valid finite number
  assert.equal(normalizeCoordinate(null), 0);
});

test('normalizeCoordinate parses numeric strings and numbers', () => {
  assert.equal(normalizeCoordinate('-6.78'), -6.78);
  assert.equal(normalizeCoordinate(42.5), 42.5);
  assert.equal(normalizeCoordinate('0'), 0);
});

test('buildGeoEvidence with valid coordinates sets hasCoordinates=true', () => {
  const lot = { lat: -6.78, lon: -76.03, parcel: 'P-001' };
  const ev = buildGeoEvidence(lot);
  assert.equal(ev.hasCoordinates, true);
  assert.equal(ev.lat, -6.78);
  assert.equal(ev.lon, -76.03);
  assert.equal(ev.parcelId, 'P-001');
  assert.equal(ev.deforestationAssessment, 'PENDING_EXTERNAL_VALIDATION');
});

test('buildGeoEvidence produces a 4-point polygon for valid coordinates', () => {
  const lot = { lat: -6.78, lon: -76.03 };
  const ev = buildGeoEvidence(lot);
  assert.equal(ev.polygonWgs84.length, 4);
  // Each polygon vertex is [lat, lon] pair
  for (const point of ev.polygonWgs84) {
    assert.equal(point.length, 2);
    assert.equal(typeof point[0], 'number');
    assert.equal(typeof point[1], 'number');
  }
});

test('buildGeoEvidence with missing coordinates sets hasCoordinates=false', () => {
  const ev = buildGeoEvidence({ lat: undefined, lon: undefined });
  assert.equal(ev.hasCoordinates, false);
  assert.equal(ev.polygonWgs84.length, 0);
  assert.equal(ev.deforestationAssessment, 'INSUFFICIENT_GEO_DATA');
  assert.equal(ev.precisionScore, 0);
});

test('buildGeoEvidence with out-of-range coordinates sets hasCoordinates=false', () => {
  const ev = buildGeoEvidence({ lat: 200, lon: -76.03 });
  assert.equal(ev.hasCoordinates, false);
});

test('buildGeoEvidence includes a non-empty hash', () => {
  const ev = buildGeoEvidence({ lat: -6.78, lon: -76.03 });
  assert.ok(ev.hash && ev.hash.length > 0, 'hash should be present');
});

test('buildGeoEvidence source is always producer_declaration', () => {
  const ev = buildGeoEvidence({ lat: -6.78, lon: -76.03 });
  assert.equal(ev.source, 'producer_declaration');
  assert.equal(ev.cutOffDate, '2020-12-31');
});
