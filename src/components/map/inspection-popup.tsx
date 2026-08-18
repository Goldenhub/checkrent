"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { RentStats } from "@/lib/types";

interface InspectionPopupProps {
  lat: number;
  lng: number;
  stats: RentStats | null;
  loading: boolean;
  onReport: (submissionId: string) => void;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function ConfidenceBadge({ level }: { level: string }) {
  const variants: Record<string, string> = {
    high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-red-500/20 text-red-400 border-red-500/30",
    none: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  return (
    <Badge variant="outline" className={`text-xs ${variants[level] ?? variants.none}`}>
      {level.toUpperCase()} CONFIDENCE
    </Badge>
  );
}

export default function InspectionPopup({ lat, lng, stats, loading, onReport, onClose }: InspectionPopupProps) {
  if (loading) {
    return (
      <Card className="w-72 bg-zinc-900/95 border-zinc-700 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
            <span className="text-sm text-zinc-400">Analyzing area...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.sample_count === 0) {
    return (
      <Card className="w-72 bg-zinc-900/95 border-zinc-700 backdrop-blur-sm">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-200">Area Inspection</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-400 hover:text-white" onClick={onClose}>
              x
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm text-zinc-400">No rental data found within this radius.</p>
          <p className="mt-1 text-xs text-zinc-500">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-zinc-900/95 border-zinc-600 backdrop-blur-sm">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-100">Area Rent Analysis</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-300 hover:text-white" onClick={onClose}>
            x
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ConfidenceBadge level={stats.confidence} />
          <span className="text-xs text-zinc-400">{stats.sample_count} samples</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-zinc-800/60 p-2">
            <p className="text-xs text-zinc-400">Median</p>
            <p className="text-lg font-bold text-white">{stats.median_rent ? formatCurrency(stats.median_rent) : "-"}</p>
          </div>
          <div className="rounded-md bg-zinc-800/60 p-2">
            <p className="text-xs text-zinc-400">Average</p>
            <p className="text-lg font-bold text-white">{stats.avg_rent ? formatCurrency(stats.avg_rent) : "-"}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Min</span>
          <span className="text-zinc-100">{stats.min_rent ? formatCurrency(stats.min_rent) : "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Max</span>
          <span className="text-zinc-100">{stats.max_rent ? formatCurrency(stats.max_rent) : "-"}</span>
        </div>

        {stats.idw_estimate && (
          <>
            <Separator className="bg-zinc-700" />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">IDW Estimate</span>
              <span className="text-cyan-400 font-medium">{formatCurrency(stats.idw_estimate)}</span>
            </div>
          </>
        )}

        {Object.keys(stats.breakdown_by_bedrooms).length > 0 && (
          <>
            <Separator className="bg-zinc-700" />
            <div>
              <p className="text-xs font-medium text-zinc-300 mb-1">By Bedrooms</p>
              <div className="space-y-1.5">
                {Object.entries(stats.breakdown_by_bedrooms)
                  .sort(([a], [b]) => {
                    const aNum = a === "3+" ? 4 : parseInt(a);
                    const bNum = b === "3+" ? 4 : parseInt(b);
                    return aNum - bNum;
                  })
                  .map(([br, data]) => (
                    <div key={br} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-300 w-6">{br === "0" ? "Stu" : br === "3+" ? "3+" : br}</span>
                        <div className="h-1.5 w-16 rounded-full bg-zinc-700/50 overflow-hidden">
                          <div className="h-full rounded-full bg-cyan-400/70" style={{ width: `${Math.min(100, (data.count / stats.sample_count) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">{data.count}x</span>
                        <span className="text-zinc-200 w-16 text-right">{formatCurrency(data.median_rent)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {Object.keys(stats.breakdown_by_type).length > 0 && (
          <>
            <Separator className="bg-zinc-700" />
            <div>
              <p className="text-xs font-medium text-zinc-300 mb-1">By Type</p>
              <div className="space-y-1.5">
                {Object.entries(stats.breakdown_by_type)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-300 whitespace-nowrap">{type.replace("_", " ")}</span>
                        <div className="h-1.5 w-16 rounded-full bg-zinc-700/50 overflow-hidden">
                          <div className="h-full rounded-full bg-cyan-400/70" style={{ width: `${Math.min(100, (data.count / stats.sample_count) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">{data.count}x</span>
                        <span className="text-zinc-200 w-16 text-right">{formatCurrency(data.median_rent)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {stats.outliers_removed > 0 && (
          <p className="text-xs text-zinc-400">{stats.outliers_removed} outlier{stats.outliers_removed > 1 ? "s" : ""} filtered</p>
        )}

        <Separator className="bg-zinc-700" />

        <div className="flex justify-between text-xs text-zinc-500">
          <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
          <Button variant="ghost" size="sm" className="h-5 p-0 text-xs text-zinc-400 hover:text-red-400" onClick={() => onReport("")}>
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
