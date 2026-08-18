"use client";

import { useState, useCallback } from "react";
import { useMap } from "./map-provider";
import { searchPlaces } from "@/lib/geocoding";
import type { GeocodingFeature } from "@/lib/types";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function SearchBar() {
  const { map } = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [open, setOpen] = useState(false);

  const handleQueryChange = useCallback(
    async (value: string) => {
      setQuery(value);
      if (value.length >= 2) {
        const features = await searchPlaces(value, {
          proximity: map ? [map.getCenter().lng, map.getCenter().lat] : undefined,
          limit: 5,
        });
        setResults(features);
        setOpen(features.length > 0);
      } else {
        setResults([]);
        setOpen(false);
      }
    },
    [map]
  );

  const handleSelect = useCallback(
    (feature: GeocodingFeature) => {
      setQuery(feature.place_name);
      setOpen(false);
      if (map) {
        map.flyTo({ center: feature.center, zoom: 14, duration: 1500 });
      }
    },
    [map]
  );

  return (
    <div className="relative w-full max-w-sm">
      <Popover open={open}>
        <PopoverTrigger className="w-full">
          <Command>
            <CommandInput
              placeholder="Search address or city..."
              value={query}
              onValueChange={handleQueryChange}
              className="h-10"
            />
          </Command>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--popover-trigger-width)] p-0 bg-zinc-900 border-zinc-700"
          align="start"
        >
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {results.map((feature) => (
                <CommandItem
                  key={feature.id}
                  onSelect={() => handleSelect(feature)}
                  className="cursor-pointer"
                >
                  {feature.place_name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
