"use client";

interface ClickMarkerProps {
  lng: number;
  lat: number;
}

export default function ClickMarker({ lng, lat }: ClickMarkerProps) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-20">
      <div
        className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 border-2 border-white shadow-lg"
        style={{
          transform: `translate(${lng}px, ${lat}px)`,
        }}
      />
    </div>
  );
}
