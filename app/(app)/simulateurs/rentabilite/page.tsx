"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DonutChart,
  RadialGauge,
  GroupedBarChart,
  LineAreaChart,
} from "@/components/charts/chart-kit";
import { calculerRentabilite, RentabiliteInputs } from "@/lib/calculs";
import { formatEUR, formatPct } from "@/lib/utils";

const defaults: RentabiliteInputs = {
  prixAchat: 200000,
  fraisNotaire: 16000,
  travaux: 12000,
  loyerMensuel: 950,
  chargesMensuelles: 250,
  taxeFonciere: 1200,
  assurancePNO: 300,
  vacanceLocativePct: 5,
  apport: 48000,
  tauxPret: 3.5,
  dureePretAnnees: 20,
  tauxMarginalImpot: 30,
};

function NumField({
  label,
  value,
  onChange,
  step = 100,
  suffix = "€",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
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

export default function RentabilitePage() {
  const [inp, setInp] = React.useState<RentabiliteInputs>(defaults);
  const set = <K extends keyof RentabiliteInputs>(k: K) => (v: number) =>
    setInp((s) => ({ ...s, [k]: v }));

  const o = calculerRentabilite(inp);

  // Projection cash-flow 25 ans
  const projection = Array.from({ length: 25 }, (_, i) => ({
    annee: `An ${i + 1}`,
    cashFlow: Math.round(o.cashFlowMensuel * 12 + i * 200),
  }));

  const charges = [
    { name: "Taxe foncière", value: inp.taxeFonciere },
    { name: "Assurance PNO", value: inp.assurancePNO },
    { name: "Charges mensuelles ×12", value: inp.chargesMensuelles * 12 },
    { name: "Intérêts prêt (an 1)", value: Math.round(o.capitalEmprunte * (inp.tauxPret / 100)) },
  ];

  const scenarios = [
    { scenario: "Pessimiste", rendement: o.rendementNet * 0.85, cashFlow: o.cashFlowMensuel - 150 },
    { scenario: "Nominal", rendement: o.rendementNet, cashFlow: o.cashFlowMensuel },
    { scenario: "Optimiste", rendement: o.rendementNet * 1.15, cashFlow: o.cashFlowMensuel + 150 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulateur de rentabilité"
        description="Calcul réel et prospectif d'un investissement — rendements, cash-flow, TRI, effort d'épargne."
        badge="Module 7"
        actions={
          <Button onClick={() => setInp(defaults)} variant="outline">
            Réinitialiser
          </Button>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Modifiez les valeurs — les calculs se mettent à jour</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <NumField label="Prix d'achat" value={inp.prixAchat} onChange={set("prixAchat")} step={1000} />
            <NumField label="Frais de notaire" value={inp.fraisNotaire} onChange={set("fraisNotaire")} step={500} />
            <NumField label="Travaux" value={inp.travaux} onChange={set("travaux")} step={500} />
            <NumField label="Loyer mensuel" value={inp.loyerMensuel} onChange={set("loyerMensuel")} step={10} />
            <NumField label="Charges mensuelles" value={inp.chargesMensuelles} onChange={set("chargesMensuelles")} step={10} />
            <NumField label="Taxe foncière / an" value={inp.taxeFonciere} onChange={set("taxeFonciere")} step={50} />
            <NumField label="Assurance PNO / an" value={inp.assurancePNO} onChange={set("assurancePNO")} step={10} />
            <NumField label="Apport" value={inp.apport} onChange={set("apport")} step={1000} />
            <NumField label="Taux du prêt" value={inp.tauxPret} onChange={set("tauxPret")} step={0.1} suffix="%" />
            <NumField label="Durée prêt (ans)" value={inp.dureePretAnnees} onChange={set("dureePretAnnees")} step={1} suffix="ans" />
            <NumField label="Taux marginal IR" value={inp.tauxMarginalImpot} onChange={set("tauxMarginalImpot")} step={1} suffix="%" />
          </CardContent>
        </Card>

        {/* Outputs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jauges de rentabilité</CardTitle>
              <CardDescription>Brut, net, net après impôts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <RadialGauge value={o.rendementBrut} max={10} label="Rendement brut" suffix=" %" thresholds={[3, 5]} />
                <RadialGauge value={o.rendementNet} max={8} label="Rendement net" suffix=" %" thresholds={[2, 4]} />
                <RadialGauge value={o.rendementNetApresImpots} max={6} label="Net après IR" suffix=" %" thresholds={[1, 3]} />
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Cash-flow / mois</p>
                  <p className={`text-lg font-bold ${o.cashFlowMensuel >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatEUR(o.cashFlowMensuel)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Mensualité prêt</p>
                  <p className="text-lg font-bold">{formatEUR(o.mensualitePret)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Effort d'épargne</p>
                  <p className="text-lg font-bold">{formatPct(o.effortEpargne)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Investissement total</p>
                  <p className="text-lg font-bold">{formatEUR(o.investissementTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projection cash-flow 25 ans</CardTitle>
              <CardDescription>Cash-flow annuel cumulé</CardDescription>
            </CardHeader>
            <CardContent>
              <LineAreaChart data={projection} dataKey="cashFlow" xKey="annee" height={260} showZeroLine />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Décomposition des charges</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={charges} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparateur de scénarios</CardTitle>
            <CardDescription>Rendement net et cash-flow</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={scenarios}
              xKey="scenario"
              series={[
                { dataKey: "rendement", name: "Rendement net (%)" },
                { dataKey: "cashFlow", name: "Cash-flow / mois (€)" },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
