export type Town = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  blurb: string;
};

export const towns: Town[] = [
  {
    id: "champions-gate",
    name: "Champions Gate",
    lat: 28.2614,
    lng: -81.6206,
    blurb: "Resort homes and golf-course communities kept green and water-wise.",
  },
  {
    id: "celebration",
    name: "Celebration",
    lat: 28.3253,
    lng: -81.5334,
    blurb: "Irrigation and lawn care for Celebration's neighborhoods and HOAs.",
  },
  {
    id: "four-corners",
    name: "Four Corners",
    lat: 28.3328,
    lng: -81.6473,
    blurb: "Serving homes and vacation rentals where four counties meet.",
  },
  {
    id: "davenport",
    name: "Davenport",
    lat: 28.1614,
    lng: -81.6017,
    blurb: "Our home base — irrigation repair, lawn care and more, close by.",
  },
  {
    id: "haines-city",
    name: "Haines City",
    lat: 28.1142,
    lng: -81.6179,
    blurb: "Residential and commercial grounds care across Haines City.",
  },
];

/** Radius (miles) around each community we treat as "in the service area". */
export const SERVICE_RADIUS_MI = 6;
/** Beyond the service area but close enough that we'd want a call. */
export const NEARBY_RADIUS_MI = 14;

/** Approximate ZIP centroids for instant lookups without a network request. */
export const zipCentroids: Record<string, { lat: number; lng: number; label: string }> = {
  "33837": { lat: 28.1942, lng: -81.6045, label: "Davenport, FL 33837" },
  "33896": { lat: 28.2485, lng: -81.5934, label: "Davenport / Champions Gate, FL 33896" },
  "33897": { lat: 28.2961, lng: -81.6823, label: "Davenport / Four Corners, FL 33897" },
  "34747": { lat: 28.3122, lng: -81.5906, label: "Celebration / Four Corners, FL 34747" },
  "33844": { lat: 28.0876, lng: -81.5873, label: "Haines City, FL 33844" },
  "33845": { lat: 28.1142, lng: -81.6179, label: "Haines City, FL 33845" },
};

export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestTown(point: { lat: number; lng: number }) {
  return towns
    .map((town) => ({ town, miles: distanceMiles(point, town) }))
    .sort((a, b) => a.miles - b.miles)[0];
}

/**
 * The service boundary drawn on the map: a generous ring around the five communities
 * (Four Corners → Celebration → Haines City → back via Davenport). [lat, lng] pairs.
 */
export const SERVICE_POLYGON: [number, number][] = [
  [28.392, -81.705],
  [28.39, -81.585],
  [28.365, -81.5],
  [28.29, -81.475],
  [28.19, -81.53],
  [28.075, -81.545],
  [28.05, -81.62],
  [28.085, -81.685],
  [28.2, -81.72],
  [28.31, -81.74],
];

/** Ray-casting point-in-polygon test against SERVICE_POLYGON. */
export function insideServiceArea(point: { lat: number; lng: number }) {
  let inside = false;
  for (let i = 0, j = SERVICE_POLYGON.length - 1; i < SERVICE_POLYGON.length; j = i++) {
    const [yi, xi] = SERVICE_POLYGON[i];
    const [yj, xj] = SERVICE_POLYGON[j];
    if (yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export type CoverageStatus = "in" | "near" | "out";

export function coverageFor(point: { lat: number; lng: number }): { status: CoverageStatus; town: Town; miles: number } {
  const { town, miles } = nearestTown(point);
  const status: CoverageStatus = insideServiceArea(point) || miles <= SERVICE_RADIUS_MI ? "in" : miles <= NEARBY_RADIUS_MI ? "near" : "out";
  return { status, town, miles };
}
