"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/chart-kit";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  trend,
  sparkData,
  color = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  sparkData?: number[];
  color?: "primary" | "success" | "warning" | "destructive";
}) {
  const colorVar =
    color === "success"
      ? "hsl(var(--success))"
      : color === "warning"
        ? "hsl(var(--warning))"
        : color === "destructive"
          ? "hsl(var(--destructive))"
          : "hsl(var(--primary))";

  return (
    <Card className="overflow-hidden animate-fade-in hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {delta && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-success" : "text-destructive",
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{delta}</span>
            <span className="text-muted-foreground font-normal">vs mois dernier</span>
          </div>
        )}
        {sparkData && (
          <div className="mt-3">
            <Sparkline data={sparkData} color={colorVar} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
