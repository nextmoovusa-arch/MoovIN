"use client";

/**
 * ChartKit — couche d'abstraction propriétaire (Module 13.4.2).
 * Expose une API uniforme et déléguera au moteur de rendu adéquat.
 * Le thème (clair/sombre) est consommé via variables CSS — pas de hard-coded.
 */

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

/* ---------- Helpers de palette consommant les CSS variables ---------- */

export const chartPalette = (n: number) =>
  Array.from({ length: n }, (_, i) => `hsl(var(--chart-${(i % 10) + 1}))`);

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--popover-foreground))",
  fontSize: 13,
  padding: "8px 12px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
};

const axisStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

/* ---------- Conteneur responsive standard ---------- */

export function ChartContainer({
  height = 280,
  children,
  className,
}: {
  height?: number;
  children: React.ReactElement;
  className?: string;
}) {
  return (
    <div className={cn("w-full animate-fade-in", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Sparkline mini-graphique (cartes KPI) ---------- */

export function Sparkline({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) {
  const chartData = data.map((value, i) => ({ i, value }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Line chart générique avec aire dégradée (cash-flow) ---------- */

export function LineAreaChart({
  data,
  dataKey,
  xKey,
  height = 320,
  showZeroLine = false,
}: {
  data: any[];
  dataKey: string;
  xKey: string;
  height?: number;
  showZeroLine?: boolean;
}) {
  return (
    <ChartContainer height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
        {showZeroLine && <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#gradPrimary)"
          animationDuration={600}
        />
      </AreaChart>
    </ChartContainer>
  );
}

/* ---------- Donut / camembert ---------- */

export function DonutChart({
  data,
  height = 280,
  innerRadius = 60,
  showLegend = true,
}: {
  data: { name: string; value: number }[];
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
}) {
  const colors = chartPalette(data.length);
  return (
    <ChartContainer height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius={100}
          paddingAngle={2}
          animationDuration={600}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} stroke="hsl(var(--card))" strokeWidth={2} />
          ))}
        </Pie>
        {showLegend && (
          <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
        )}
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartContainer>
  );
}

/* ---------- Grouped bar chart (loyers prévus vs encaissés) ---------- */

export function GroupedBarChart({
  data,
  xKey,
  series,
  height = 280,
}: {
  data: any[];
  xKey: string;
  series: { dataKey: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ChartContainer height={height}>
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color ?? `hsl(var(--chart-${i + 1}))`}
            radius={[4, 4, 0, 0]}
            animationDuration={600}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

/* ---------- Radial gauge (jauges de performance) ---------- */

export function RadialGauge({
  value,
  max = 100,
  label,
  thresholds = [50, 75],
  suffix = "%",
}: {
  value: number;
  max?: number;
  label: string;
  thresholds?: [number, number];
  suffix?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    pct < thresholds[0]
      ? "hsl(var(--destructive))"
      : pct < thresholds[1]
        ? "hsl(var(--warning))"
        : "hsl(var(--success))";
  // Demi-cercle SVG custom
  const r = 60;
  const c = Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <svg viewBox="0 0 160 90" width="100%" height="100" aria-label={`${label}: ${value}${suffix}`}>
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
        <text
          x="80"
          y="70"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="22"
          fontWeight={600}
        >
          {typeof value === "number" ? value.toFixed(1).replace(".", ",") : value}
          {suffix}
        </text>
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- Heatmap calendaire des paiements ---------- */

export function PaymentHeatmap({
  rows,
}: {
  rows: { bien: string; mois: { label: string; statut: "paye" | "retard" | "impaye" }[] }[];
}) {
  const colorOf = (s: string) =>
    s === "paye"
      ? "hsl(var(--success))"
      : s === "retard"
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  return (
    <div className="overflow-x-auto animate-fade-in">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 font-medium text-muted-foreground">Bien</th>
            {rows[0]?.mois.map((m, i) => (
              <th key={i} className="p-1 font-normal text-muted-foreground">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.bien}>
              <td className="p-2 text-foreground truncate max-w-[180px]">{row.bien}</td>
              {row.mois.map((m, i) => (
                <td key={i} className="p-1">
                  <div
                    title={`${row.bien} • ${m.label} • ${m.statut}`}
                    className="h-6 w-6 rounded-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: colorOf(m.statut) }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-success" /> Payé à temps
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-warning" /> Retard
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-destructive" /> Impayé
        </span>
      </div>
    </div>
  );
}

/* ---------- Radar (note d'investissement Module 12) ---------- */

export function RadarMini({ data, height = 260 }: { data: { axis: string; value: number }[]; height?: number }) {
  return (
    <ChartContainer height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="axis" tick={axisStyle} />
        <PolarRadiusAxis tick={axisStyle} angle={30} />
        <Radar
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.25}
          animationDuration={600}
        />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ChartContainer>
  );
}

/* ---------- Line chart simple ---------- */

export function SimpleLineChart({
  data,
  xKey,
  series,
  height = 280,
}: {
  data: any[];
  xKey: string;
  series: { dataKey: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ChartContainer height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            stroke={s.color ?? `hsl(var(--chart-${i + 1}))`}
            strokeWidth={2}
            dot={false}
            animationDuration={600}
            name={s.name}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

/* ---------- Stacked area (amortissement) ---------- */

export function StackedAreaChart({
  data,
  xKey,
  series,
  height = 280,
}: {
  data: any[];
  xKey: string;
  series: { dataKey: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ChartContainer height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
        {series.map((s, i) => (
          <Area
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            stackId="1"
            stroke={s.color ?? `hsl(var(--chart-${i + 1}))`}
            fill={s.color ?? `hsl(var(--chart-${i + 1}))`}
            fillOpacity={0.6}
            animationDuration={600}
            name={s.name}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

/* ---------- Horizontal bar (Top locataires à risque, pyramide durées) ---------- */

export function HorizontalBarChart({
  data,
  xKey,
  yKey,
  height = 280,
  color = "hsl(var(--primary))",
}: {
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
}) {
  return (
    <ChartContainer height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis dataKey={yKey} type="category" tick={axisStyle} axisLine={false} tickLine={false} width={100} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
        <Bar dataKey={xKey} fill={color} radius={[0, 4, 4, 0]} animationDuration={600} />
      </BarChart>
    </ChartContainer>
  );
}
