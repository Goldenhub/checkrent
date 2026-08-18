"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PropertyType } from "@/lib/types";

interface ReviewStepProps {
  city: string;
  neighborhood: string;
  formatted_address: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

const PROPERTY_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  studio: "Studio",
  house: "House",
  shared_room: "Shared Room",
};

export default function ReviewStep({
  city, neighborhood, formatted_address, amount, currency, frequency,
  property_type, bedrooms, bathrooms, onSubmit, onBack, submitting, submitted, error,
}: ReviewStepProps) {
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Submitted!</h3>
          <p className="text-sm text-zinc-400">Thank you for contributing to the rent map.</p>
        </div>
      </div>
    );
  }

  const annual = frequency === "monthly" ? amount * 12 : amount;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Review Submission</h3>
        <p className="text-sm text-zinc-400">Please verify your details</p>
      </div>

      <div className="rounded-md bg-zinc-800/50 p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Location</span>
          <span className="text-zinc-300">{formatted_address || `${city}${neighborhood ? `, ${neighborhood}` : ""}`}</span>
        </div>
        <Separator className="bg-zinc-700" />
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Rent</span>
          <span className="text-white font-medium">
            {formatCurrency(amount, currency)}/{frequency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Annual</span>
          <span className="text-zinc-300">{formatCurrency(annual, currency)}</span>
        </div>
        <Separator className="bg-zinc-700" />
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Type</span>
          <span className="text-zinc-300">{PROPERTY_LABELS[property_type]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Bedrooms</span>
          <span className="text-zinc-300">{bedrooms === 0 ? "Studio" : bedrooms}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Bathrooms</span>
          <span className="text-zinc-300">{bathrooms}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-md p-2">{error}</p>
      )}

      <p className="text-xs text-zinc-500 text-center">
        Your exact location will be anonymized to a hexagonal grid cell. No personal data is stored.
      </p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-zinc-700 text-zinc-400">
          Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">
          {submitting ? "Submitting..." : "Submit Anonymously"}
        </Button>
      </div>
    </div>
  );
}
