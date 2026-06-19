"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { EmptyState } from "@/components/ui/empty-state";
import { DonutChart, RadialGauge, PaymentHeatmap } from "@/components/charts/chart-kit";
import { PageHeader } from "@/components/layout/page-header";
import { useBiens, useLocataires } from "@/lib/store";
import {
  valeurPatrimoine,
  loyersDuMois,
  rendementNetMoyen,
  rendementBrutMoyen,
  tauxOccupation,
  repartitionPatrimoine,
  repartitionCharges,
  heatmapPaiements,
  alertesConformite,
} from "@/lib/derived";
import { formatEUR } from "@/lib/utils";
import { AlertTriangle, Bell, Building2, Download } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const valeur = valeurPatrimoine(biens);
  const loyersMois = loyersDuMois(biens, locataires);
  const rendementNet = rendementNetMoyen(biens, locataires);
  const rendementBrut = rendementBrutMoyen(biens, locataires);
  const occupation = tauxOccupation(biens, locataires);

  const patrimoine = repartitionPatrimoine(biens).map((p) => ({ name: p.name, value: p.value }));
  const charges = repartitionCharges(biens);
  const alertes = alertesConformite(biens, locataires);

  const isEmpty = biens.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue 360° de votre patrimoine immobilier — KPIs en temps réel, alertes de conformité et indicateurs visuels."
        badge="Module 1"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Exporter PDF
            </Button>
            <Button size="sm">
              <Bell className="h-4 w-4" /> Notifications
            </Button>
          </>
        }
      />

      {isEmpty ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="Votre portefeuille est vide"
              message="Ajoutez votre premier bien pour faire apparaître vos KPIs, graphiques et alertes."
              action={
                <Button asChild>
                  <Link href="/biens">
                    <Building2 className="h-4 w-4" /> Ajouter un bien
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Zone A — 4 cartes KPI */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Valeur patrimoine"
              value={formatEUR(valeur)}
              color="primary"
              info={{
                content: <p><strong>Formule :</strong> Σ des prix d'achat de tous vos biens.</p>,
              }}
            />
            <StatCard
              label="Loyers du mois"
              value={formatEUR(loyersMois)}
              color="success"
              info={{
                content: <p><strong>Formule :</strong> Σ des loyers des baux actifs.</p>,
              }}
            />
            <StatCard
              label="Rendement brut moyen"
              value={`${rendementBrut.toFixed(1).replace(".", ",")} %`}
              color="warning"
              info={{
                content: <p><strong>Formule :</strong> (loyer annuel / prix d'achat), moyenné sur les biens loués.</p>,
              }}
            />
            <StatCard
              label="Rendement net moyen"
              value={`${rendementNet.toFixed(1).replace(".", ",")} %`}
              color="warning"
              info={{
                content: <p><strong>Formule :</strong> (loyers annuels − charges − taxe) / (prix + notaire).</p>,
              }}
            />
          </section>

          {/* Zone C — Patrimoine + charges */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitleInfo
                  title="Répartition du patrimoine"
                  hint="Donut : chaque segment est un bien, proportionnel à son prix d'achat. Permet de détecter une concentration excessive."
                />
                <CardDescription>Valeur de chaque bien dans le total</CardDescription>
              </CardHeader>
              <CardContent>
                {patrimoine.length > 0 ? (
                  <DonutChart data={patrimoine} />
                ) : (
                  <EmptyState compact message="Ajoutez des biens pour voir la répartition." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitleInfo
                  title="Décomposition des charges annuelles"
                  hint="Donut des charges réelles saisies sur vos biens : taxe foncière et charges courantes annualisées."
                />
                <CardDescription>Taxe foncière, charges courantes…</CardDescription>
              </CardHeader>
              <CardContent>
                {charges.length > 0 ? (
                  <DonutChart data={charges} />
                ) : (
                  <EmptyState compact message="Renseignez taxe foncière et charges sur vos biens." />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Jauges de performance */}
          <Card>
            <CardHeader>
              <CardTitleInfo
                title="Jauges de performance"
                hint="Rendement brut/net moyens et taux d'occupation calculés sur votre portefeuille réel."
              />
              <CardDescription>Rendement et occupation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <RadialGauge value={rendementBrut} max={10} label="Rendement brut" suffix=" %" thresholds={[3, 5]} />
                <RadialGauge value={rendementNet} max={8} label="Rendement net" suffix=" %" thresholds={[2, 4]} />
                <RadialGauge value={occupation} label="Taux occupation" thresholds={[80, 90]} />
              </div>
            </CardContent>
          </Card>

          {/* Zone D — Heatmap + alertes */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitleInfo
                  title="Carte de chaleur des paiements"
                  hint={
                    <>
                      <p>Heatmap 12 mois × biens.</p>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        <li><span className="text-success">●</span> Vert : loyer payé (via le portail locataire)</li>
                        <li><span className="text-destructive">●</span> Rouge : aucun paiement enregistré</li>
                        <li><span className="text-muted-foreground">●</span> Gris : pas de locataire</li>
                      </ul>
                    </>
                  }
                />
                <CardDescription>Basée sur les paiements réels enregistrés dans le portail locataire</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentHeatmap rows={heatmapPaiements(biens, locataires, readPaiements(locataires))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitleInfo
                    title="Alertes de conformité"
                    hint="Calculées automatiquement : DPE F/G, fins de bail dans moins de 90 jours."
                  />
                  <Badge variant={alertes.length > 0 ? "destructive" : "secondary"}>{alertes.length}</Badge>
                </div>
                <CardDescription>Action requise à court terme</CardDescription>
              </CardHeader>
              <CardContent>
                {alertes.length === 0 ? (
                  <EmptyState compact title="Aucune alerte" message="Tout est en règle pour l'instant." />
                ) : (
                  <ul className="space-y-3">
                    {alertes.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start gap-3 rounded-lg border bg-elevated p-3 transition-colors hover:border-primary/40"
                      >
                        <AlertTriangle
                          className={
                            a.type === "destructive"
                              ? "h-4 w-4 mt-0.5 text-destructive shrink-0"
                              : a.type === "warning"
                                ? "h-4 w-4 mt-0.5 text-warning shrink-0"
                                : "h-4 w-4 mt-0.5 text-primary shrink-0"
                          }
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{a.titre}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Échéance : {new Date(a.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

/** Lit les paiements enregistrés par chaque locataire dans le portail. */
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
