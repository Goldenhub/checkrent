"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Map } from "maplibre-gl";

interface MapContextType {
  map: Map | null;
  setMap: (map: Map) => void;
  isLoaded: boolean;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMapState] = useState<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const setMap = useCallback((m: Map) => {
    setMapState(m);
    m.on("load", () => setIsLoaded(true));
  }, []);

  return (
    <MapContext.Provider value={{ map, setMap, isLoaded, userLocation, setUserLocation }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap(): MapContextType {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within a MapProvider");
  return ctx;
}
