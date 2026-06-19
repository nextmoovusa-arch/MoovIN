"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DonutChart } from "@/components/charts/chart-kit";
import { PageHeader } from "@/components/layout/page-header";
import { useBiens, useLocataires, etatDuBien } from "@/lib/store";
import {
  valeurPatrimoine,
  loyersDuMois,
  rendementNetMoyen,
  rendementBrutMoyen,
  tauxOccupation,
  repartitionPatrimoine,
  alertesConformite,
} from "@/lib/derived";
import { formatEUR, formatPct, cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Euro,
  Home,
  Percent,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const valeur = valeurPatrimoine(biens);
  const loyersMois = loyersDuMois(biens, locataires);
  const rendementNet = rendementNetMoyen(biens, locataires);
  const rendementBrut = rendementBrutMoyen(biens, locataires);
  const occupation = tauxOccupation(biens, locataires);
  const nbOccupes = biens.filter((b) => etatDuBien(b, locataires) === "Occupé").length;

  const patrimoine = repartitionPatrimoine(biens).map((p) => ({ name: p.name, value: p.value }));
  const alertes = alertesConformite(biens, locataires);

  if (biens.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tableau de bord"
          description="Une vue claire et synthétique de votre patrimoine."
        />
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={Building2}
              title="Bienvenue sur MoovIN"
              message="Ajoutez votre premier bien pour voir apparaître vos indicateurs clés."
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="L'essentiel de votre patrimoine en un coup d'œil."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/analytics">
              Voir le détail <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* Grands chiffres */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Valeur du patrimoine"
          value={formatEUR(valeur)}
          icon={Building2}
          accent="primary"
          hint={`${biens.length} bien${biens.length > 1 ? "s" : ""}`}
        />
        <KpiCard
          label="Loyers du mois"
          value={formatEUR(loyersMois)}
          icon={Euro}
          accent="success"
          hint={`${nbOccupes} loué${nbOccupes > 1 ? "s" : ""}`}
        />
        <KpiCard
          label="Rendement net moyen"
          value={formatPct(rendementNet)}
          icon={Percent}
          accent="violet"
          hint="après charges"
        />
        <KpiCard
          label="Taux d'occupation"
          value={`${Math.round(occupation)} %`}
          icon={Home}
          accent={occupation >= 90 ? "success" : occupation >= 70 ? "warning" : "primary"}
          hint={`${nbOccupes}/${biens.length} occupés`}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Santé — barres simples */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Santé du portefeuille</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Meter label="Taux d'occupation" value={occupation} target={90} suffix=" %" />
            <Meter label="Rendement brut moyen" value={rendementBrut} max={8} target={5} suffix=" %" />
            <Meter label="Rendement net moyen" value={rendementNet} max={6} target={4} suffix=" %" />
            <div className="flex items-center gap-2 pt-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Revenu locatif annuel estimé</span>
              <span className="ml-auto text-sm font-semibold">{formatEUR(loyersMois * 12)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Répartition — un seul graphe simple */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Répartition du patrimoine</CardTitle>
          </CardHeader>
          <CardContent>
            {patrimoine.length > 0 ? (
              <DonutChart data={patrimoine} height={240} showLegend={false} />
            ) : (
              <EmptyState compact message="Aucune donnée." />
            )}
          </CardContent>
        </Card>

        {/* Alertes compactes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alertes</CardTitle>
              <Badge variant={alertes.length > 0 ? "destructive" : "secondary"}>{alertes.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {alertes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <AlertTriangle className="h-5 w-5 text-success" />
                </div>
                <p className="mt-2 text-sm font-medium">Tout est en règle</p>
                <p className="text-xs text-muted-foreground">Aucune action requise.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {alertes.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        a.type === "destructive" ? "bg-destructive" : a.type === "warning" ? "bg-warning" : "bg-primary",
                      )}
                    />
                    <p className="text-sm leading-snug">{a.titre}</p>
                  </li>
                ))}
                {alertes.length > 5 && (
                  <li>
                    <Link href="/conformite" className="text-xs text-primary hover:underline">
                      Voir les {alertes.length} alertes →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/** Barre de progression simple avec repère de cible. */
function Meter({
  label,
  value,
  max = 100,
  target,
  suffix = "",
}: {
  label: string;
  value: number;
  max?: number;
  target?: number;
  suffix?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const reachedTarget = target !== undefined && value >= target;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">
          {value.toFixed(1).replace(".", ",")}
          {suffix}
        </span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", reachedTarget ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
        {target !== undefined && (
          <span
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-foreground/40"
            style={{ left: `${Math.min(100, (target / max) * 100)}%` }}
            title={`Objectif : ${target}${suffix}`}
          />
        )}
      </div>
    </div>
  );
}
