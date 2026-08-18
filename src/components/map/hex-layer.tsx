"use client";

import { useEffect, useRef } from "react";
import { useMap } from "./map-provider";
import type { H3GridResponse } from "@/lib/types";

interface HexLayerProps {
  data: H3GridResponse | null;
}

function getRentColor(medianRent: number): string {
  if (medianRent < 1500) return "#3b82f6";
  if (medianRent < 2500) return "#22d3ee";
  if (medianRent < 3500) return "#facc15";
  if (medianRent < 5000) return "#f97316";
  return "#ef4444";
}

function getRentOpacity(count: number): number {
  if (count > 15) return 0.85;
  if (count > 8) return 0.7;
  if (count > 3) return 0.55;
  return 0.35;
}

export default function HexLayer({ data }: HexLayerProps) {
  const { map } = useMap();
  const sourceAdded = useRef(false);

  useEffect(() => {
    if (!map || !data) return;

    const addLayer = () => {
      if (sourceAdded.current) {
        try {
          map.removeLayer("hex-fill");
          map.removeLayer("hex-outline");
          map.removeSource("hex-grid");
        } catch {}
        sourceAdded.current = false;
      }

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.features.map((f) => ({
          type: "Feature",
          properties: {
            ...f.properties,
            color: getRentColor(f.properties.median_rent),
            opacity: getRentOpacity(f.properties.count),
          },
          geometry: f.geometry,
        })),
      };

      map.addSource("hex-grid", { type: "geojson", data: geojson });

      map.addLayer({
        id: "hex-fill",
        type: "fill",
        source: "hex-grid",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      });

      map.addLayer({
        id: "hex-outline",
        type: "line",
        source: "hex-grid",
        paint: {
          "line-color": "#ffffff",
          "line-width": 0.5,
          "line-opacity": 0.4,
        },
      });

      sourceAdded.current = true;
    };

    if (map.loaded()) {
      addLayer();
    } else {
      map.on("load", addLayer);
    }

    return () => {
      if (sourceAdded.current) {
        try {
          if (map.getLayer("hex-fill")) map.removeLayer("hex-fill");
          if (map.getLayer("hex-outline")) map.removeLayer("hex-outline");
          if (map.getSource("hex-grid")) map.removeSource("hex-grid");
          sourceAdded.current = false;
        } catch {}
      }
    };
  }, [map, data]);

  return null;
}
