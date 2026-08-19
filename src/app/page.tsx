"use client";

import dynamic from "next/dynamic";
import { MapProvider } from "@/components/map/map-provider";
import { MapFiltersProvider } from "@/hooks/use-map-filters";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="text-sm text-zinc-500">Loading checkRent...</p>
      </div>
    </div>
  ),
});

const FormSheet = dynamic(() => import("@/components/rent-form/form-sheet"), {
  ssr: false,
});

const OnboardingTour = dynamic(
  () => import("@/components/onboarding/onboarding-tour"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <MapFiltersProvider>
        <MapProvider>
          <MapContainer />
          <FormSheet />
          <OnboardingTour />
        </MapProvider>
      </MapFiltersProvider>
    </main>
  );
}
