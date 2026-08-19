"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOnboarding, type TourStep } from "@/hooks/use-onboarding";

const TOUR_STEPS: TourStep[] = [
  {
    id: "search",
    target: "search",
    title: "Search",
    description: "Search for any address or city to fly there on the map.",
    placement: "bottom",
  },
  {
    id: "filters",
    target: "filters",
    title: "Filters",
    description: "Filter rent data by bedrooms or property type to narrow down results.",
    placement: "bottom",
  },
  {
    id: "area-count",
    target: "area-count",
    title: "Data Points",
    description: "See how many rent data points are currently visible in this map view.",
    placement: "bottom",
  },
  {
    id: "map",
    target: "map",
    title: "Explore the Map",
    description: "Click anywhere on the map to inspect area rent stats — min, max, median, average, and breakdowns by bedrooms and property type.",
    placement: "top",
  },
  {
    id: "log-rent",
    target: "log-rent",
    title: "Contribute",
    description: "Anonymously share your rent data to help others make informed decisions.",
    placement: "top",
  },
  {
    id: "about",
    target: "about",
    title: "Learn More",
    description: "Revisit this tour or read about checkRent anytime.",
    placement: "top",
  },
];

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getTargetRect(selector: string): TargetRect | null {
  const el = document.querySelector(`[data-tour-id="${selector}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function getTooltipPosition(
  target: TargetRect,
  placement: TourStep["placement"],
  tooltipWidth: number,
  tooltipHeight: number
): { x: number; y: number; arrow: "left" | "right" | "center" } {
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let x: number;
  let y: number;
  let arrow: "left" | "right" | "center" = "center";

  if (placement === "bottom") {
    x = target.x + target.width / 2 - tooltipWidth / 2;
    y = target.y + target.height + pad;
  } else if (placement === "top") {
    x = target.x + target.width / 2 - tooltipWidth / 2;
    y = target.y - tooltipHeight - pad;
  } else if (placement === "left") {
    x = target.x - tooltipWidth - pad;
    y = target.y + target.height / 2 - tooltipHeight / 2;
  } else {
    x = target.x + target.width + pad;
    y = target.y + target.height / 2 - tooltipHeight / 2;
  }

  if (x < pad) {
    arrow = "left";
    x = pad;
  } else if (x + tooltipWidth > vw - pad) {
    arrow = "right";
    x = vw - tooltipWidth - pad;
  }

  if (y < pad) y = pad;
  if (y + tooltipHeight > vh - pad) y = vh - tooltipHeight - pad;

  return { x, y, arrow };
}

export default function OnboardingTour() {
  const tour = useOnboarding(TOUR_STEPS);
  const [target, setTarget] = useState<TargetRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 300, height: 160 });

  const measureTarget = useCallback(() => {
    if (!tour.step) {
      setTarget(null);
      return;
    }
    const rect = getTargetRect(tour.step.target);
    setTarget(rect);
  }, [tour.step]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => measureTarget());
    window.addEventListener("resize", measureTarget);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureTarget);
    };
  }, [measureTarget]);

  useEffect(() => {
    if (!tooltipRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTooltipSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(tooltipRef.current);
    return () => obs.disconnect();
  }, [tour.step]);

  if (!tour.isActive || !tour.step || !target) return null;

  const padding = 8;
  const rx = 10;
  const { x: tx, y: ty } = getTooltipPosition(
    target,
    tour.step.placement,
    tooltipSize.width,
    tooltipSize.height
  );

  return (
    <div className="fixed inset-0 z-[100]">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={target.x - padding}
              y={target.y - padding}
              width={target.width + padding * 2}
              height={target.height + padding * 2}
              rx={rx}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-mask)"
        />
        <rect
          x={target.x - padding}
          y={target.y - padding}
          width={target.width + padding * 2}
          height={target.height + padding * 2}
          rx={rx}
          fill="none"
          stroke="rgba(34,211,238,0.5)"
          strokeWidth="2"
        />
      </svg>

      <div
        ref={tooltipRef}
        className="absolute animate-in fade-in zoom-in-95 duration-200"
        style={{ left: tx, top: ty, width: 320 }}
      >
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">{tour.step.title}</h3>
            <span className="text-[10px] text-zinc-500">
              {tour.currentStep + 1} / {tour.totalSteps}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            {tour.step.description}
          </p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={tour.skipTour}
              className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {tour.currentStep > 0 && (
                <button
                  type="button"
                  onClick={tour.prevStep}
                  className="rounded-md px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={tour.nextStep}
                className="rounded-md bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                {tour.currentStep === tour.totalSteps - 1 ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
