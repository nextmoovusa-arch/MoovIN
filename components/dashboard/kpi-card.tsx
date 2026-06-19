import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

type Accent = "primary" | "success" | "warning" | "violet";

const accentMap: Record<Accent, { soft: string; text: string; bar: string }> = {
  primary: { soft: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  success: { soft: "bg-success/10", text: "text-success", bar: "bg-success" },
  warning: { soft: "bg-warning/10", text: "text-warning", bar: "bg-warning" },
  violet: { soft: "bg-chart-4/10", text: "text-chart-4", bar: "bg-chart-4" },
};

/**
 * Carte KPI épurée : grand chiffre, icône douce, accent discret.
 * Pensée pour un tableau de bord léger et lisible.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  delta,
  trend,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
}) {
  const a = accentMap[accent];
  return (
    <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <div className={cn("absolute inset-x-0 top-0 h-1", a.bar)} />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", a.soft)}>
          <Icon className={cn("h-4 w-4", a.text)} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend === "down" ? "text-destructive" : "text-success",
            )}
          >
            {trend === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {delta}
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
