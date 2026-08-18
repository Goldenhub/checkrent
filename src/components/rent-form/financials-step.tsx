"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FinancialsStepProps {
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
  onUpdate: (partial: Partial<{ amount: number; currency: string; frequency: "monthly" | "yearly" }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default function FinancialsStep({ amount, currency, frequency, onUpdate, onNext, onBack }: FinancialsStepProps) {
  const annualEquivalent = frequency === "monthly" ? amount * 12 : amount;
  const canProceed = amount > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Rent Details</h3>
        <p className="text-sm text-zinc-400">How much do you pay?</p>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Amount</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={amount || ""}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <select
            value={currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Payment Frequency</Label>
        <div className="flex gap-2">
          {(["monthly", "yearly"] as const).map((freq) => (
            <Button
              key={freq}
              variant="outline"
              className={cn(
                "flex-1 border-zinc-700",
                frequency === freq ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
              )}
              onClick={() => onUpdate({ frequency: freq })}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {amount > 0 && (
        <div className="rounded-md bg-zinc-800/50 p-3">
          <p className="text-xs text-zinc-500">Annual Equivalent</p>
          <p className="text-lg font-bold text-white">
            {new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(annualEquivalent)}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-zinc-700 text-zinc-400">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">
          Continue
        </Button>
      </div>
    </div>
  );
}
