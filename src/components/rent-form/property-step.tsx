"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PropertyType } from "@/lib/types";

interface PropertyStepProps {
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  onUpdate: (partial: Partial<{ property_type: PropertyType; bedrooms: number; bathrooms: number }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROPERTY_OPTIONS: Array<{ value: PropertyType; label: string }> = [
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "House" },
  { value: "shared_room", label: "Shared Room" },
];

export default function PropertyStep({ property_type, bedrooms, bathrooms, onUpdate, onNext, onBack }: PropertyStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Property Details</h3>
        <p className="text-sm text-zinc-400">Tell us about your rental</p>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Property Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              className={cn(
                "border-zinc-700",
                property_type === opt.value ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
              )}
              onClick={() => onUpdate({ property_type: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Bedrooms</Label>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((n) => (
            <Button
              key={n}
              variant="outline"
              className={cn(
                "flex-1 border-zinc-700",
                bedrooms === n ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
              )}
              onClick={() => onUpdate({ bedrooms: n })}
            >
              {n === 0 ? "Studio" : n === 3 ? "3+" : n}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Bathrooms</Label>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              variant="outline"
              className={cn(
                "flex-1 border-zinc-700",
                bathrooms === n ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
              )}
              onClick={() => onUpdate({ bathrooms: n })}
            >
              {n === 3 ? "3+" : n}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-zinc-700 text-zinc-400">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">
          Review
        </Button>
      </div>
    </div>
  );
}
