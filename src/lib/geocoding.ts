import type { GeocodingFeature } from "./types";

const GEOCODING_API = "/api/geocoding";

export async function searchPlaces(
  query: string,
  options?: {
    proximity?: [number, number];
    limit?: number;
  }
): Promise<GeocodingFeature[]> {
  const params = new URLSearchParams({
    action: "search",
    q: query,
    limit: String(options?.limit ?? 5),
  });

  if (options?.proximity) {
    params.set("proximity", `${options.proximity[0]},${options.proximity[1]}`);
  }

  const res = await fetch(`${GEOCODING_API}?${params}`);
  if (!res.ok) return [];

  return (await res.json()) as GeocodingFeature[];
}

export async function reverseGeocode(
  coordinates: [number, number]
): Promise<GeocodingFeature | null> {
  const params = new URLSearchParams({
    action: "reverse",
    lon: String(coordinates[0]),
    lat: String(coordinates[1]),
  });

  const res = await fetch(`${GEOCODING_API}?${params}`);
  if (!res.ok) return null;

  return (await res.json()) as GeocodingFeature;
}
