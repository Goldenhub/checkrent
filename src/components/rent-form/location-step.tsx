"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchPlaces, reverseGeocode } from "@/lib/geocoding";
import type { GeocodingFeature } from "@/lib/types";

interface LocationStepProps {
  lat: number | null;
  lng: number | null;
  city: string;
  neighborhood: string;
  formatted_address: string;
  onUpdate: (partial: { lat: number; lng: number; city: string; neighborhood: string; formatted_address: string }) => void;
  onNext: () => void;
}

export default function LocationStep({ lat, lng, city, neighborhood, formatted_address, onUpdate, onNext }: LocationStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleCurrentLocation = useCallback(() => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const feature = await reverseGeocode([lng, lat]);
        const address = feature?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const cityFromCtx = feature?.context?.find((c) => c.id.startsWith("place"))?.text || "";
        const neighborhoodFromCtx = feature?.context?.find((c) => c.id.startsWith("neighborhood"))?.text || "";
        onUpdate({ lat, lng, city: cityFromCtx, neighborhood: neighborhoodFromCtx, formatted_address: address });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        alert("Could not access your location. Please try manual search.");
      }
    );
  }, [onUpdate]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) {
      const features = await searchPlaces(q, { limit: 5 });
      setSuggestions(features);
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSelectSuggestion = useCallback(
    (feature: GeocodingFeature) => {
      const [lng, lat] = feature.center;
      const cityFromCtx = feature.context?.find((c) => c.id.startsWith("place"))?.text || "";
      const neighborhoodFromCtx = feature.context?.find((c) => c.id.startsWith("neighborhood"))?.text || "";
      onUpdate({ lat, lng, city: cityFromCtx, neighborhood: neighborhoodFromCtx, formatted_address: feature.place_name });
      setSearchQuery(feature.place_name);
      setSuggestions([]);
    },
    [onUpdate]
  );

  const canProceed = lat !== null && lng !== null && city.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Where is your rental?</h3>
        <p className="text-sm text-zinc-400">Choose how to locate your property</p>
      </div>

      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        )}
        Use My Current Location
      </Button>

      <div className="relative">
        <Label className="text-zinc-400 text-sm mb-1 block">Or search manually</Label>
        <Input
          placeholder="Enter address or city..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 first:rounded-t-md last:rounded-b-md"
                onClick={() => handleSelectSuggestion(feature)}
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {lat !== null && lng !== null && (
        <div className="rounded-md bg-zinc-800/50 p-3 space-y-1">
          <p className="text-sm text-white font-medium">{formatted_address || "Selected Location"}</p>
          <p className="text-xs text-zinc-500">{city}{neighborhood ? `, ${neighborhood}` : ""}</p>
          <p className="text-xs text-zinc-600">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
        </div>
      )}

      <Button onClick={onNext} disabled={!canProceed} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
        Continue
      </Button>
    </div>
  );
}
