"use client";

import { useRentForm } from "@/hooks/use-rent-form";
import LocationStep from "./location-step";
import FinancialsStep from "./financials-step";
import PropertyStep from "./property-step";
import ReviewStep from "./review-step";

interface RentFormProps {
  onSuccess?: () => void;
}

export default function RentForm({ onSuccess }: RentFormProps) {
  const { step, data, update, next, back, submit, submitting, submitted, error } = useRentForm();

  if (submitted) {
    return (
      <div className="p-6">
        <ReviewStep
          city={data.city}
          neighborhood={data.neighborhood}
          formatted_address={data.formatted_address}
          amount={data.amount}
          currency={data.currency}
          frequency={data.frequency}
          property_type={data.property_type}
          bedrooms={data.bedrooms}
          bathrooms={data.bathrooms}
          onSubmit={submit}
          onBack={back}
          submitting={submitting}
          submitted={submitted}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-2">
        {(["location", "financials", "property", "review"] as const).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s === step ? "bg-cyan-500" : i < ["location", "financials", "property", "review"].indexOf(step) ? "bg-zinc-600" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {step === "location" && (
        <LocationStep
          lat={data.lat}
          lng={data.lng}
          city={data.city}
          neighborhood={data.neighborhood}
          formatted_address={data.formatted_address}
          onUpdate={(p) => update(p)}
          onNext={next}
        />
      )}

      {step === "financials" && (
        <FinancialsStep
          amount={data.amount}
          currency={data.currency}
          frequency={data.frequency}
          onUpdate={(p) => update(p)}
          onNext={next}
          onBack={back}
        />
      )}

      {step === "property" && (
        <PropertyStep
          property_type={data.property_type}
          bedrooms={data.bedrooms}
          bathrooms={data.bathrooms}
          onUpdate={(p) => update(p)}
          onNext={next}
          onBack={back}
        />
      )}

      {step === "review" && (
        <ReviewStep
          city={data.city}
          neighborhood={data.neighborhood}
          formatted_address={data.formatted_address}
          amount={data.amount}
          currency={data.currency}
          frequency={data.frequency}
          property_type={data.property_type}
          bedrooms={data.bedrooms}
          bathrooms={data.bathrooms}
          onSubmit={() => {
            submit();
            if (!error) onSuccess?.();
          }}
          onBack={back}
          submitting={submitting}
          submitted={false}
          error={error}
        />
      )}
    </div>
  );
}
