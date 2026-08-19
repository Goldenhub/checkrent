"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "checkrent-tour-done";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface UseOnboardingReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | null;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
}

export function useOnboarding(steps: TourStep[]): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        completeTour();
        return 0;
      }
      return prev + 1;
    });
  }, [steps.length, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}
    const timer = setTimeout(() => startTour(), 1500);
    return () => clearTimeout(timer);
  }, [startTour]);

  useEffect(() => {
    if (!isActive) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      else if (e.key === "ArrowLeft") prevStep();
      else if (e.key === "Escape") skipTour();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  const step = isActive ? steps[currentStep] ?? null : null;

  return {
    isActive,
    currentStep,
    totalSteps: steps.length,
    step,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  };
}
