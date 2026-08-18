import { z } from "zod";

export const PropertyTypeSchema = z.enum(["apartment", "studio", "house", "shared_room"]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const SubmitSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().min(1).max(100),
  neighborhood: z.string().max(100).optional(),
  formatted_address: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  frequency: z.enum(["monthly", "yearly"]),
  property_type: PropertyTypeSchema,
  bedrooms: z.number().int().min(0).max(10),
  bathrooms: z.number().int().min(1).max(10),
  device_fingerprint: z.string().min(1).max(64),
});

export type SubmitInput = z.infer<typeof SubmitSchema>;

export function annualizeAmount(amount: number, frequency: "monthly" | "yearly"): number {
  return frequency === "monthly" ? amount * 12 : amount;
}

export const StatsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius_km: z.coerce.number().positive().max(10).default(1.5),
  bedrooms: z.coerce.number().int().min(0).max(10).optional(),
  property_type: z.string().optional(),
});

export const H3GridQuerySchema = z.object({
  north: z.coerce.number().min(-90).max(90),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  west: z.coerce.number().min(-180).max(180),
  resolution: z.coerce.number().int().min(0).max(15).default(8),
  bedrooms: z.coerce.number().int().min(0).max(10).optional(),
  property_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const ReportSchema = z.object({
  submission_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
});
