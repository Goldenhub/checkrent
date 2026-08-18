"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import type { MapFilters, PropertyType } from "@/lib/types";

interface MapFiltersContextType {
  filters: MapFilters;
  setBedrooms: (bedrooms: number | null) => void;
  setPropertyType: (type: PropertyType | null) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: MapFilters = {
  bedrooms: null,
  property_type: null,
  date_from: null,
  date_to: null,
};

const MapFiltersContext = createContext<MapFiltersContextType | null>(null);

export function MapFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  const setBedrooms = useCallback((bedrooms: number | null) => {
    setFilters((prev) => ({ ...prev, bedrooms }));
  }, []);

  const setPropertyType = useCallback((property_type: PropertyType | null) => {
    setFilters((prev) => ({ ...prev, property_type }));
  }, []);

  const setDateRange = useCallback((date_from: string | null, date_to: string | null) => {
    setFilters((prev) => ({ ...prev, date_from, date_to }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <MapFiltersContext.Provider value={{ filters, setBedrooms, setPropertyType, setDateRange, resetFilters }}>
      {children}
    </MapFiltersContext.Provider>
  );
}

export function useMapFilters(): MapFiltersContextType {
  const ctx = useContext(MapFiltersContext);
  if (!ctx) throw new Error("useMapFilters must be used within a MapFiltersProvider");
  return ctx;
}
