"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Building2, PieChart, Euro, Zap, CreditCard } from "lucide-react";
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
        <PageHeader title="Analytics" description="Toutes vos analyses détaillées, organisées par thème." badge="Module 13" />
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={Building2}
              title="Aucune donnée à analyser"
              message="Les analyses se construisent à partir de vos biens et locataires."
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
      <PageHeader title="Analytics" description="Toutes vos analyses détaillées, organisées par thème." badge="Module 13" />

      <Tabs defaultValue="patrimoine">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="patrimoine" className="gap-1.5">
            <PieChart className="h-4 w-4" /> Patrimoine
          </TabsTrigger>
          <TabsTrigger value="charges" className="gap-1.5">
            <Euro className="h-4 w-4" /> Charges
          </TabsTrigger>
          <TabsTrigger value="energie" className="gap-1.5">
            <Zap className="h-4 w-4" /> Énergie
          </TabsTrigger>
          <TabsTrigger value="paiements" className="gap-1.5">
            <CreditCard className="h-4 w-4" /> Paiements
          </TabsTrigger>
        </TabsList>

        {/* Patrimoine */}
        <TabsContent value="patrimoine">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitleInfo title="Répartition par bien" hint="Poids de chaque bien dans la valeur totale du portefeuille." />
                <CardDescription>Valeur de chaque bien</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={patrimoine} />
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
          </div>
        </TabsContent>

        {/* Charges */}
        <TabsContent value="charges">
          <Card>
            <CardHeader>
              <CardTitleInfo title="Décomposition des charges annuelles" hint="Charges réelles saisies : taxe foncière et charges courantes annualisées." />
              <CardDescription>Sur l'ensemble du portefeuille</CardDescription>
            </CardHeader>
            <CardContent>
              {charges.length > 0 ? (
                <DonutChart data={charges} height={320} />
              ) : (
                <EmptyState compact message="Renseignez taxe foncière et charges sur vos biens." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Énergie */}
        <TabsContent value="energie">
          <Card>
            <CardHeader>
              <CardTitleInfo
                title="Classes DPE du patrimoine"
                hint={
                  <>
                    <p>Nombre de biens par classe énergétique.</p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li>2025 : G interdit · 2028 : F · 2034 : E</li>
                    </ul>
                  </>
                }
              />
              <CardDescription>Performance énergétique</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupedBarChart data={dpe} xKey="classe" series={[{ dataKey: "nb", name: "Biens" }]} height={320} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiements */}
        <TabsContent value="paiements">
          <Card>
            <CardHeader>
              <CardTitleInfo
                title="Carte de chaleur des paiements"
                hint={
                  <>
                    <p>12 mois × biens, basée sur les encaissements réels.</p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li><span className="text-success">●</span> payé · <span className="text-destructive">●</span> non reçu · <span className="text-muted-foreground">●</span> sans locataire</li>
                    </ul>
                  </>
                }
              />
              <CardDescription>Encaissements enregistrés via le portail / la banque</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHeatmap rows={heatmapPaiements(biens, locataires, readPaiements(locataires))} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
