import { haversineDistance } from "./h3";
import type { DataPoint } from "./types";

export function idwInterpolation(
  points: DataPoint[],
  queryLat: number,
  queryLng: number,
  power = 2,
  maxRadius = 5
): number | null {
  if (points.length === 0) return null;

  let weightedSum = 0;
  let weightSum = 0;

  for (const point of points) {
    const dist = haversineDistance(queryLat, queryLng, point.lat, point.lng);

    if (dist < 0.001) return point.value;

    if (dist <= maxRadius) {
      const weight = 1 / Math.pow(dist, power);
      weightedSum += weight * point.value;
      weightSum += weight;
    }
  }

  if (weightSum === 0) return null;
  return weightedSum / weightSum;
}

export function filterOutliersIQR(values: number[]): {
  filtered: number[];
  q1: number;
  q3: number;
  iqr: number;
  lowerBound: number;
  upperBound: number;
} {
  if (values.length < 4) {
    return {
      filtered: [...values],
      q1: 0,
      q3: 0,
      iqr: 0,
      lowerBound: -Infinity,
      upperBound: Infinity,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return {
    filtered: values.filter((v) => v >= lowerBound && v <= upperBound),
    q1,
    q3,
    iqr,
    lowerBound,
    upperBound,
  };
}
