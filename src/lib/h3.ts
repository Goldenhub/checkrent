import { cellToBoundary, latLngToCell } from "h3-js";

export const H3_DEFAULT_RESOLUTION = 8;

export function toH3(lat: number, lng: number, resolution = H3_DEFAULT_RESOLUTION): string {
  return latLngToCell(lat, lng, resolution);
}

export function h3ToGeoJSON(h3Index: string): number[][][] {
  const boundary = cellToBoundary(h3Index);
  const coords: number[][] = boundary.map(([lat, lng]) => [lng, lat]);
  coords.push(coords[0]);
  return [coords];
}

export function getConfidence(count: number): "high" | "medium" | "low" | "none" {
  if (count > 15) return "high";
  if (count > 8) return "medium";
  if (count > 0) return "low";
  return "none";
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
