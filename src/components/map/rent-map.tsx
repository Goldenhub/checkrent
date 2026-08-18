"use client";

import { useRef, useEffect, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "./map-provider";

interface RentMapProps {
  initialCenter: [number, number];
  initialZoom?: number;
  onMapClick?: (lng: number, lat: number) => void;
  children?: React.ReactNode;
}

const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const FALLBACK_CENTER: [number, number] = [-74.006, 40.7128];

export default function RentMap({ initialCenter, initialZoom = 12, onMapClick, children }: RentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const { setMap } = useMap();

  const safeCenter: [number, number] =
    initialCenter &&
    typeof initialCenter[0] === "number" &&
    typeof initialCenter[1] === "number" &&
    !isNaN(initialCenter[0]) &&
    !isNaN(initialCenter[1])
      ? initialCenter
      : FALLBACK_CENTER;

  const handleClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!mapInstance.current) return;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      const el = document.createElement("div");
      el.className = "click-marker";
      el.style.cssText =
        "width:16px;height:16px;background:#22d3ee;border:2px solid white;border-radius:50%;box-shadow:0 0 12px rgba(34,211,238,0.5);cursor:pointer;transform:translate(-50%,-50%);";

      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(e.lngLat)
        .addTo(mapInstance.current);

      onMapClick?.(e.lngLat.lng, e.lngLat.lat);
    },
    [onMapClick]
  );

  useEffect(() => {
    if (mapInstance.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: safeCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    if (onMapClick) {
      map.on("click", handleClick);
    }

    mapInstance.current = map;
    setMap(map);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
}
