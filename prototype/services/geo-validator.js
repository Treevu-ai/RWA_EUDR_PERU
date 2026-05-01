/**
 * geo-validator.js
 *
 * Pure-JS geospatial validation utilities for EUDR compliance.
 *
 * EUDR Regulation (EU) 2023/1115 requires that plots > 4 ha are represented
 * as valid, closed polygons in WGS84 (EPSG:4326).  A closed polygon has its
 * first and last coordinate pair identical.
 *
 * No external dependencies – works in any Node.js >= 18 environment.
 */

/**
 * Verify that a GeoJSON Feature or Geometry represents a valid EUDR polygon.
 *
 * @param {object} geojson - GeoJSON Feature or Geometry (Polygon / MultiPolygon)
 * @param {object} [options]
 * @param {number} [options.areaTolerance=0] - Minimum area in m² to require closure check (default: always).
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateEudrPolygon(geojson, options = {}) {
  const errors = [];
  const warnings = [];

  if (!geojson || typeof geojson !== 'object') {
    return { valid: false, errors: ['GeoJSON input is null or not an object'], warnings };
  }

  // Unwrap Feature → Geometry
  const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;

  if (!geometry || !geometry.type) {
    return { valid: false, errors: ['Missing geometry or geometry.type'], warnings };
  }

  const supportedTypes = ['Polygon', 'MultiPolygon'];
  if (!supportedTypes.includes(geometry.type)) {
    return {
      valid: false,
      errors: [`Unsupported geometry type "${geometry.type}". EUDR requires Polygon or MultiPolygon.`],
      warnings
    };
  }

  const rings = geometry.type === 'Polygon'
    ? geometry.coordinates
    : geometry.coordinates.flat(1);

  if (!Array.isArray(rings) || rings.length === 0) {
    return { valid: false, errors: ['Geometry has no coordinate rings'], warnings };
  }

  rings.forEach((ring, ringIndex) => {
    const label = `Ring ${ringIndex}`;

    // Must be an array
    if (!Array.isArray(ring)) {
      errors.push(`${label}: coordinates are not an array`);
      return;
    }

    // Minimum 4 positions for a valid polygon ring (3 unique + closing repeat)
    if (ring.length < 4) {
      errors.push(`${label}: has only ${ring.length} position(s); a valid polygon ring needs at least 4 (3 unique + closing)`);
      return;
    }

    // Validate each coordinate pair
    ring.forEach((coord, i) => {
      if (!Array.isArray(coord) || coord.length < 2) {
        errors.push(`${label}[${i}]: coordinate is not a [lon, lat] pair`);
        return;
      }
      const [lon, lat] = coord;
      if (typeof lon !== 'number' || !Number.isFinite(lon) || lon < -180 || lon > 180) {
        errors.push(`${label}[${i}]: longitude ${lon} is out of WGS84 range [-180, 180]`);
      }
      if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        errors.push(`${label}[${i}]: latitude ${lat} is out of WGS84 range [-90, 90]`);
      }
    });

    // Closure check: first and last coordinates must be identical
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (!Array.isArray(first) || !Array.isArray(last)) return; // already flagged above

    const isClosed =
      first[0] === last[0] &&
      first[1] === last[1];

    if (!isClosed) {
      errors.push(
        `${label}: polygon is not closed. ` +
        `First coordinate [${first}] ≠ last coordinate [${last}]. ` +
        'EUDR requires the first and last positions to be identical.'
      );
    }

    // Warn about low-precision coordinates (EUDR expects at least 5 decimal places ~ ±1 m)
    const [flon, flat] = first;
    const lonDecimals = (String(Math.abs(flon)).split('.')[1] || '').length;
    const latDecimals = (String(Math.abs(flat)).split('.')[1] || '').length;
    if (lonDecimals < 5 || latDecimals < 5) {
      warnings.push(
        `${label}: coordinates have low precision (lon: ${lonDecimals} decimals, lat: ${latDecimals} decimals). ` +
        'EUDR recommends at least 5 decimal places (≈ 1 m accuracy).'
      );
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Close an open polygon ring in-place by appending the first coordinate at the end.
 * Returns a *new* array; the original is not mutated.
 *
 * @param {number[][]} ring - Array of [lon, lat] pairs
 * @returns {number[][]} Closed ring
 */
export function closeRing(ring) {
  if (!Array.isArray(ring) || ring.length === 0) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  const isClosed = Array.isArray(first) && Array.isArray(last) &&
    first[0] === last[0] && first[1] === last[1];
  return isClosed ? [...ring] : [...ring, [...first]];
}

/**
 * Attempt to auto-correct a GeoJSON Polygon by closing all open rings.
 * Returns a new GeoJSON object (does not mutate the input).
 *
 * @param {object} geojson - GeoJSON Feature or Polygon geometry
 * @returns {object} Corrected GeoJSON
 */
export function autoClosePolygon(geojson) {
  const isFeature = geojson && geojson.type === 'Feature';
  const geometry = isFeature ? geojson.geometry : geojson;

  if (!geometry || geometry.type !== 'Polygon') {
    return geojson; // Only auto-close simple polygons
  }

  const closedCoords = (geometry.coordinates || []).map(closeRing);
  const correctedGeometry = { ...geometry, coordinates: closedCoords };

  return isFeature
    ? { ...geojson, geometry: correctedGeometry }
    : correctedGeometry;
}

/**
 * Estimate the approximate area of a GeoJSON Polygon ring using the Shoelace formula
 * projected on a spherical Earth (suitable for small plots, ± a few percent).
 *
 * @param {number[][]} ring - Array of [lon, lat] pairs (closed or open)
 * @returns {number} Approximate area in square metres
 */
export function estimateRingAreaM2(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return 0;

  // Ensure ring is closed for the calculation
  const closed = closeRing(ring);
  const n = closed.length - 1; // exclude closing duplicate

  const R = 6371008.8; // Earth mean radius in metres
  const toRad = deg => (deg * Math.PI) / 180;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const [lon1, lat1] = closed[i];
    const [lon2, lat2] = closed[(i + 1) % n];
    area += toRad(lon2 - lon1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }

  return Math.abs((area * R * R) / 2);
}

/**
 * Convert square metres to hectares.
 * @param {number} m2
 * @returns {number}
 */
export function m2ToHectares(m2) {
  return m2 / 10000;
}
