"use client";

import { useState, useCallback } from "react";
import type { PropertyType, SubmitPayload } from "@/lib/types";

export type FormStep = "location" | "financials" | "property" | "review";

interface FormData {
  lat: number | null;
  lng: number | null;
  city: string;
  neighborhood: string;
  formatted_address: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
}

const INITIAL: FormData = {
  lat: null,
  lng: null,
  city: "",
  neighborhood: "",
  formatted_address: "",
  amount: 0,
  currency: "USD",
  frequency: "monthly",
  property_type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
};

export function useRentForm() {
  const [step, setStep] = useState<FormStep>("location");
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((partial: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const next = useCallback(() => {
    setStep((prev) => {
      if (prev === "location") return "financials";
      if (prev === "financials") return "property";
      if (prev === "property") return "review";
      return prev;
    });
  }, []);

  const back = useCallback(() => {
    setStep((prev) => {
      if (prev === "financials") return "location";
      if (prev === "property") return "financials";
      if (prev === "review") return "property";
      return prev;
    });
  }, []);

  const generateFingerprint = useCallback((): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("fingerprint", 2, 2);
    }
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ];
    let hash = 0;
    const str = components.join("|");
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }, []);

  const submit = useCallback(async () => {
    if (!data.lat || !data.lng || !data.city || data.amount <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: SubmitPayload = {
        lat: data.lat,
        lng: data.lng,
        city: data.city,
        neighborhood: data.neighborhood || undefined,
        formatted_address: data.formatted_address || undefined,
        amount: data.amount,
        currency: data.currency,
        frequency: data.frequency,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        device_fingerprint: generateFingerprint(),
      };

      const res = await fetch("/api/rent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [data, generateFingerprint]);

  const reset = useCallback(() => {
    setStep("location");
    setData(INITIAL);
    setSubmitted(false);
    setError(null);
  }, []);

  return { step, data, update, next, back, submit, reset, submitting, submitted, error };
}
