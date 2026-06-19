"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { GroupedBarChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBiens, useLocataires } from "@/lib/store";
import { dpePatrimoine, alertesConformite } from "@/lib/derived";
import { AlertTriangle, Calendar, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ConformitePage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const dpe = dpePatrimoine(biens);
  const alertes = alertesConformite(biens, locataires);

  if (biens.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Conformité" description="DPE, PNO, baux, diagnostics — alertes automatisées et calendrier visuel." badge="Module 10" />
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="Aucun bien à suivre"
              message="Le suivi de conformité (DPE, baux, échéances) s'active dès que vous ajoutez un bien."
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
      <PageHeader title="Conformité" description="DPE, PNO, baux, diagnostics — alertes automatisées et calendrier visuel." badge="Module 10" />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo
              title="Répartition DPE du patrimoine"
              hint={
                <>
                  <p>Nombre de biens par classe énergétique (A → G).</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>2025 : classe G interdite</li>
                    <li>2028 : classe F interdite</li>
                    <li>2034 : classe E interdite</li>
                  </ul>
                </>
              }
            />
            <CardDescription>Seuil légal : G interdit 2025, F 2028</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart data={dpe} xKey="classe" series={[{ dataKey: "nb", name: "Biens" }]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Échéances à venir"
              hint="Alertes calculées automatiquement : DPE défavorables et fins de bail dans moins de 90 jours."
            />
            <CardDescription>Calculé sur vos biens et baux</CardDescription>
          </CardHeader>
          <CardContent>
            {alertes.length === 0 ? (
              <EmptyState compact icon={ShieldCheck} title="Aucune échéance" message="Aucune alerte de conformité détectée." />
            ) : (
              <ul className="space-y-3">
                {alertes.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 rounded-lg border bg-elevated p-3">
                    {a.type === "destructive" ? (
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                    ) : (
                      <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{a.titre}</p>
                      <Badge variant="secondary" className="mt-1">
                        {new Date(a.date).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
