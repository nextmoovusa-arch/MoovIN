"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { DonutChart, GroupedBarChart, PaymentHeatmap } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useBiens, useLocataires } from "@/lib/store";
import {
  repartitionPatrimoine,
  repartitionCharges,
  repartitionParType,
  dpePatrimoine,
  heatmapPaiements,
} from "@/lib/derived";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const patrimoine = repartitionPatrimoine(biens).map((p) => ({ name: p.name, value: p.value }));
  const charges = repartitionCharges(biens);
  const parType = repartitionParType(biens);
  const dpe = dpePatrimoine(biens);

  if (biens.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Centre transverse de visualisation — agrégation, drill-down, exports." badge="Module 13" />
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="Aucune donnée à analyser"
              message="Les analyses se construisent à partir de vos biens et locataires réels."
              action={
                <Button asChild>
                  <Link href="/biens">Ajouter un bien</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Centre transverse de visualisation — agrégation, drill-down, exports." badge="Module 13" />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo title="Patrimoine" hint="Donut : poids de chaque bien dans la valeur totale." />
            <CardDescription>Répartition par bien</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={patrimoine} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo title="Charges" hint="Donut des charges annuelles réelles (taxe foncière + charges courantes)." />
            <CardDescription>Décomposition annuelle</CardDescription>
          </CardHeader>
          <CardContent>
            {charges.length > 0 ? (
              <DonutChart data={charges} />
            ) : (
              <EmptyState compact message="Renseignez les charges de vos biens." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo title="Répartition par type" hint="Nombre de biens par typologie (Studio, T1, T2…)." />
            <CardDescription>Typologie du portefeuille</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={parType} />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Classes DPE du patrimoine"
              hint="Nombre de biens par classe énergétique. Rappel : G interdit 2025, F 2028, E 2034."
            />
            <CardDescription>Performance énergétique</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart data={dpe} xKey="classe" series={[{ dataKey: "nb", name: "Biens" }]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Heatmap paiements"
              hint="Vue annuelle des encaissements réels enregistrés via le portail locataire."
            />
            <CardDescription>Vue agrégée annuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentHeatmap rows={heatmapPaiements(biens, locataires, readPaiements(locataires))} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function readPaiements(locataires: { id: string }[]): Record<string, { mois: string }[]> {
  const out: Record<string, { mois: string }[]> = {};
  if (typeof window === "undefined") return out;
  for (const l of locataires) {
    try {
      const raw = window.localStorage.getItem(`moovin.paiements.${l.id}`);
      out[l.id] = raw ? JSON.parse(raw) : [];
    } catch {
      out[l.id] = [];
    }
  }
  return out;
}
