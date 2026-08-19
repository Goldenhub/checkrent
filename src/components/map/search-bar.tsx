"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMap } from "./map-provider";
import { searchPlaces } from "@/lib/geocoding";
import type { GeocodingFeature } from "@/lib/types";

export default function SearchBar() {
  const { map } = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const features = await searchPlaces(value, {
            proximity: map ? [map.getCenter().lng, map.getCenter().lat] : undefined,
            limit: 5,
          });
          setResults(features);
          setOpen(features.length > 0);
        } catch {
          setResults([]);
          setOpen(false);
        }
      }, 300);
    },
    [map]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div ref={wrapperRef} className="relative w-full max-w-sm" data-tour-id="search">
      <div className="flex items-center gap-2">
        <input
          type="search"
          placeholder="Search address or city..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <button
          type="button"
          onClick={() => {
            if (!map) return;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1500 });
              },
              () => {},
              { enableHighAccuracy: true }
            );
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer backdrop-blur-sm"
          title="Go to my location"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          </svg>
        </button>
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {results.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {feature.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
