"use client";

import { Button } from "@/components/ui/button";
import { useMapFilters } from "@/hooks/use-map-filters";
import { cn } from "@/lib/utils";
import type { PropertyType } from "@/lib/types";

const BEDROOM_OPTIONS = [null, 0, 1, 2, 3] as const;
const PROPERTY_TYPES: Array<{ value: PropertyType | null; label: string }> = [
  { value: null, label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "House" },
  { value: "shared_room", label: "Shared" },
];

export default function FilterToolbar() {
  const { filters, setBedrooms, setPropertyType, resetFilters } = useMapFilters();
  const hasFilters = filters.bedrooms !== null || filters.property_type !== null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-700/50 px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 mr-1">BR</span>
        {BEDROOM_OPTIONS.map((br) => (
          <Button
            key={String(br)}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              filters.bedrooms === br
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
            onClick={() => setBedrooms(br)}
          >
            {br === null ? "Any" : br === 3 ? "3+" : br}
          </Button>
        ))}
      </div>

      <div className="h-4 w-px bg-zinc-700" />

      <div className="flex items-center gap-1">
        {PROPERTY_TYPES.map((pt) => (
          <Button
            key={pt.label}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              filters.property_type === pt.value
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
            onClick={() => setPropertyType(pt.value)}
          >
            {pt.label}
          </Button>
        ))}
      </div>

      {hasFilters && (
        <>
          <div className="h-4 w-px bg-zinc-700" />
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-zinc-500 hover:text-white" onClick={resetFilters}>
            Reset
          </Button>
        </>
      )}
    </div>
  );
}
