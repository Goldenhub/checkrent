"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMap } from "./map-provider";
import { useMapFilters } from "@/hooks/use-map-filters";
import RentMap from "./rent-map";
import SearchBar from "./search-bar";
import FilterToolbar from "./filter-toolbar";
import InspectionPopup from "./inspection-popup";
import AboutPopover from "./about-popover";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { H3GridResponse, RentStats } from "@/lib/types";

export default function MapContainer() {
  const { center } = useGeolocation();
  const { filters } = useMapFilters();
  const { map } = useMap();
  const [h3Data, setH3Data] = useState<H3GridResponse | null>(null);
  const [clickPoint, setClickPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [inspectionStats, setInspectionStats] = useState<RentStats | null>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [areaCount, setAreaCount] = useState(0);
  const fetchedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  });

  const fetchH3Grid = useCallback(async () => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const f = filtersRef.current;
    const params = new URLSearchParams({
      north: bounds.getNorth().toString(),
      south: bounds.getSouth().toString(),
      east: bounds.getEast().toString(),
      west: bounds.getWest().toString(),
    });
    if (f.bedrooms !== null) params.set("bedrooms", f.bedrooms.toString());
    if (f.property_type) params.set("property_type", f.property_type);

    try {
      const res = await fetch(`/api/rent/h3-grid?${params}`);
      if (res.ok) {
        const data = await res.json();
        setH3Data(data);
        setAreaCount(data.features?.length ?? 0);
      }
    } catch (e) {
      console.error("Failed to fetch H3 grid:", e);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const debouncedFetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchH3Grid(), 500);
    };

    map.on("moveend", debouncedFetch);

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      const initFetch = () => setTimeout(() => fetchH3Grid(), 0);
      if (map.loaded()) initFetch();
      else map.once("load", initFetch);
    }

    return () => {
      map.off("moveend", debouncedFetch);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map, fetchH3Grid]);

  useEffect(() => {
    if (!map || !h3Data) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: h3Data.features.map((f) => ({
        type: "Feature",
        properties: {
          ...f.properties,
        },
        geometry: f.geometry,
      })),
    };

    try {
      const source = map.getSource("hex-grid") as { setData: (data: GeoJSON.FeatureCollection) => void } | undefined;
      if (source) {
        source.setData(geojson);
      }
    } catch (e) {
      console.error("[hex] error:", e);
    }
  }, [map, h3Data]);

  useEffect(() => {
    if (!map || !fetchedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchH3Grid(), 300);
  }, [filters, map, fetchH3Grid]);

  const handleMapClick = useCallback(
    async (lng: number, lat: number) => {
      setClickPoint({ lat, lng });
      setInspectionLoading(true);
      setInspectionStats(null);

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_km: "1.5",
      });
      if (filters.bedrooms !== null) params.set("bedrooms", filters.bedrooms.toString());
      if (filters.property_type) params.set("property_type", filters.property_type);

      try {
        const res = await fetch(`/api/rent/stats?${params}`);
        if (res.ok) {
          const data = await res.json();
          setInspectionStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      } finally {
        setInspectionLoading(false);
      }
    },
    [filters]
  );

  const handleReport = useCallback(async (submissionId: string) => {
    if (!submissionId) return;
    try {
      await fetch("/api/rent/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId }),
      });
    } catch {}
  }, []);

  return (
      <div className="relative h-full w-full" data-tour-id="map">
      <RentMap
        initialCenter={[center.lng, center.lat]}
        initialZoom={12}
        onMapClick={handleMapClick}
      />

      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:flex-none sm:w-80">
            <SearchBar />
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-lg bg-zinc-900/80 border border-zinc-700/50 px-3 py-2 backdrop-blur-sm" data-tour-id="area-count">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-400 whitespace-nowrap">
              {areaCount > 0 ? `${areaCount} areas` : "Loading..."}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <FilterToolbar />
        </div>
      </div>

      {clickPoint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 sm:left-4 sm:translate-x-0 sm:bottom-4">
          <InspectionPopup
            lat={clickPoint.lat}
            lng={clickPoint.lng}
            stats={inspectionStats}
            loading={inspectionLoading}
            onReport={handleReport}
            onClose={() => setClickPoint(null)}
          />
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 z-30 ml-28">
        <AboutPopover />
      </div>
    </div>
  );
}
