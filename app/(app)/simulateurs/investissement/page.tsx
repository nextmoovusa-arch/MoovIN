"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialGauge, RadarMini, LineAreaChart } from "@/components/charts/chart-kit";
import {
  calculerRentabilite,
  noteInvestissement,
  verdictInvestissement,
  RentabiliteInputs,
} from "@/lib/calculs";
import { formatEUR, formatPct, cn } from "@/lib/utils";

const defaults: RentabiliteInputs = {
  prixAchat: 180000,
  fraisNotaire: 14400,
  travaux: 10000,
  loyerMensuel: 820,
  chargesMensuelles: 180,
  taxeFonciere: 1000,
  assurancePNO: 280,
  vacanceLocativePct: 5,
  apport: 40000,
  tauxPret: 3.6,
  dureePretAnnees: 20,
  tauxMarginalImpot: 30,
};

function Field({
  label,
  value,
  onChange,
  suffix = "€",
  step = 100,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <span className="px-3 py-2 text-sm text-muted-foreground border-l">{suffix}</span>
      </div>
    </label>
  );
}

export default function InvestissementPage() {
  const [inp, setInp] = React.useState<RentabiliteInputs>(defaults);
  const set = <K extends keyof RentabiliteInputs>(k: K) => (v: number) =>
    setInp((s) => ({ ...s, [k]: v }));

  const o = calculerRentabilite(inp);
  const note = noteInvestissement(o);
  const verdict = verdictInvestissement(note);

  const radar = [
    { axis: "Rendement", value: Math.min(100, (o.rendementNet / 6) * 100) },
    { axis: "Cash-flow", value: o.cashFlowMensuel >= 0 ? 90 : 40 },
    { axis: "Localisation", value: 70 },
    { axis: "Évolution", value: 75 },
    { axis: "Sécurité", value: 80 },
  ];

  const projection = Array.from({ length: 25 }, (_, i) => ({
    annee: `An ${i + 1}`,
    patrimoine: Math.round(inp.prixAchat * Math.pow(1.02, i)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Est-ce que ce bien est rentable ?"
        description="Saisissez quelques données — recevez un verdict clair avec note /100, radar et projection 25 ans."
        badge="Module 12"
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inputs minimaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Prix d'achat" value={inp.prixAchat} onChange={set("prixAchat")} step={1000} />
            <Field label="Loyer proposé" value={inp.loyerMensuel} onChange={set("loyerMensuel")} step={10} />
            <Field label="Charges mensuelles" value={inp.chargesMensuelles} onChange={set("chargesMensuelles")} step={10} />
            <Field label="Taxe foncière / an" value={inp.taxeFonciere} onChange={set("taxeFonciere")} step={50} />
            <Field label="Travaux" value={inp.travaux} onChange={set("travaux")} step={500} />
            <Field label="Apport" value={inp.apport} onChange={set("apport")} step={1000} />
            <Field label="Taux prêt" value={inp.tauxPret} onChange={set("tauxPret")} step={0.1} suffix="%" />
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* VERDICT XL */}
          <Card
            className={cn(
              "border-2",
              verdict.color === "success" && "border-success/40 bg-success/5",
              verdict.color === "warning" && "border-warning/40 bg-warning/5",
              verdict.color === "destructive" && "border-destructive/40 bg-destructive/5",
            )}
          >
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:col-span-1">
                  <RadialGauge value={note} label="Note /100" suffix="" thresholds={[50, 70]} />
                </div>
                <div className="md:col-span-2 text-center md:text-left">
                  <p className="text-sm font-medium text-muted-foreground">Verdict</p>
                  <h2
                    className={cn(
                      "mt-2 text-3xl md:text-4xl font-bold tracking-tight",
                      verdict.color === "success" && "text-success",
                      verdict.color === "warning" && "text-warning",
                      verdict.color === "destructive" && "text-destructive",
                    )}
                  >
                    {verdict.label}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Rendement net <strong className="text-foreground">{formatPct(o.rendementNet)}</strong> ·
                    Cash-flow <strong className="text-foreground">{formatEUR(o.cashFlowMensuel)}</strong>/mois ·
                    Effort d'épargne <strong className="text-foreground">{formatPct(o.effortEpargne)}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar indicateurs</CardTitle>
              <CardDescription>Comparaison aux moyennes marché</CardDescription>
            </CardHeader>
            <CardContent>
              <RadarMini data={radar} />
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Projection patrimoine 25 ans</CardTitle>
          <CardDescription>Valeur estimée avec inflation 2 % / an</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={projection} dataKey="patrimoine" xKey="annee" />
        </CardContent>
      </Card>
    </div>
  );
}
