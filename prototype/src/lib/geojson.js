export const validatePolygonCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return { valid: false, error: "polygon coordinates are required" };
  }

  const ring = coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    return { valid: false, error: "polygon must contain at least 4 points" };
  }

  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) {
      return { valid: false, error: "each point must be [lng, lat]" };
    }
    const [lng, lat] = point;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return { valid: false, error: "coordinates must be numeric" };
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return { valid: false, error: "coordinates out of WGS84 range" };
    }
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];
  const closed = firstLng === lastLng && firstLat === lastLat;
  if (!closed) {
    return { valid: false, error: "polygon ring must be closed (first point equals last point)" };
  }

  return { valid: true };
};

export const toGeoJsonFeatureCollection = (input) => {
  if (input?.type === "FeatureCollection") return input;
  if (input?.type === "Feature") return { type: "FeatureCollection", features: [input] };
  throw new Error("geojson payload must be Feature or FeatureCollection");
};
