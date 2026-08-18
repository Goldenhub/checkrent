"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };

function getInitialState(): GeolocationState {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lng, loading: false, error: "Geolocation not supported" };
  }
  return { latitude: null, longitude: null, loading: true, error: null };
}

export function useGeolocation(): GeolocationState & { center: { lat: number; lng: number } } {
  const [state, setState] = useState<GeolocationState>(getInitialState);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const timeoutId = setTimeout(() => {
      setState((prev) => {
        if (prev.loading) {
          return { latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lng, loading: false, error: "Timeout" };
        }
        return prev;
      });
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        clearTimeout(timeoutId);
        setState({
          latitude: DEFAULT_CENTER.lat,
          longitude: DEFAULT_CENTER.lng,
          loading: false,
          error: "Permission denied",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    ...state,
    center: {
      lat: state.latitude ?? DEFAULT_CENTER.lat,
      lng: state.longitude ?? DEFAULT_CENTER.lng,
    },
  };
}
