export interface RentSubmission {
  id: string;
  city: string;
  neighborhood: string | null;
  formatted_address: string | null;
  annual_amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
  raw_amount: number;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  h3_index: string;
  is_flagged: boolean;
  flag_count: number;
  created_at: string;
  lat: number;
  lng: number;
}

export type PropertyType = "apartment" | "studio" | "house" | "shared_room";

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

export interface RentStats {
  min_rent: number | null;
  max_rent: number | null;
  avg_rent: number | null;
  median_rent: number | null;
  sample_count: number;
  confidence: ConfidenceLevel;
  idw_estimate: number | null;
  filtered_count: number;
  original_count: number;
  outliers_removed: number;
  breakdown_by_bedrooms: Record<string, { count: number; avg_rent: number; median_rent: number }>;
  breakdown_by_type: Record<string, { count: number; avg_rent: number; median_rent: number }>;
}

export interface H3CellData {
  h3_index: string;
  avg_rent: number;
  median_rent: number;
  count: number;
  confidence: ConfidenceLevel;
  center_lat: number;
  center_lng: number;
}

export interface H3GridResponse {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      h3_index: string;
      avg_rent: number;
      median_rent: number;
      count: number;
      confidence: ConfidenceLevel;
    };
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
  }>;
}

export interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
  geometry: { type: string; coordinates: [number, number] };
  properties: Record<string, unknown>;
  context?: Array<{ id: string; text: string }>;
}

export interface MapFilters {
  bedrooms: number | null;
  property_type: PropertyType | null;
  date_from: string | null;
  date_to: string | null;
}

export interface SubmitPayload {
  lat: number;
  lng: number;
  city: string;
  neighborhood?: string;
  formatted_address?: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  device_fingerprint: string;
}

export interface DataPoint {
  lat: number;
  lng: number;
  value: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}
