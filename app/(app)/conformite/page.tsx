"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBiens, useLocataires } from "@/lib/store";
import { alertesConformite } from "@/lib/derived";
import { AlertTriangle, Calendar, Building2, ShieldCheck, Zap, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500",
  E: "bg-orange-500", F: "bg-red-500", G: "bg-rose-600",
};

export default function ConformitePage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const alertes = alertesConformite(biens, locataires);
  const nbCritiques = alertes.filter((a) => a.type === "destructive").length;
  const nbPassoires = biens.filter((b) => b.dpe === "F" || b.dpe === "G").length;

  // Score global simple : 100 − pénalités
  const score = Math.max(
    0,
    100 - nbCritiques * 20 - (alertes.length - nbCritiques) * 8 - nbPassoires * 5,
  );

  // Compte DPE par classe (pour la barre visuelle compacte)
  const dpeCounts = (["A", "B", "C", "D", "E", "F", "G"] as const).map((c) => ({
    classe: c,
    nb: biens.filter((b) => b.dpe === c).length,
  }));

  if (biens.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Conformité" description="DPE, baux et échéances réglementaires." badge="Module 10" />
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={Building2}
              title="Aucun bien à suivre"
              message="Le suivi de conformité s'active dès que vous ajoutez un bien."
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
      <PageHeader title="Conformité" description="DPE, baux et échéances réglementaires." badge="Module 10" />

      {/* Grands chiffres */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Score de conformité"
          animateValue={score}
          format={(n) => `${Math.round(n)}/100`}
          icon={ShieldCheck}
          accent={score >= 80 ? "success" : score >= 60 ? "warning" : "primary"}
          hint={score >= 80 ? "en règle" : "à surveiller"}
        />
        <KpiCard
          label="Alertes en cours"
          animateValue={alertes.length}
          format={(n) => `${Math.round(n)}`}
          icon={FileWarning}
          accent={alertes.length === 0 ? "success" : "warning"}
          hint={`${nbCritiques} critique${nbCritiques > 1 ? "s" : ""}`}
        />
        <KpiCard
          label="Passoires énergétiques"
          animateValue={nbPassoires}
          format={(n) => `${Math.round(n)}`}
          icon={Zap}
          accent={nbPassoires === 0 ? "success" : "warning"}
          hint="classes F & G"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DPE — barre compacte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition énergétique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dpeCounts.map(({ classe, nb }) => {
              const pct = biens.length > 0 ? (nb / biens.length) * 100 : 0;
              return (
                <div key={classe} className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[classe]}`}>
                    {classe}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", dpeColors[classe])} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-medium tabular-nums text-muted-foreground">{nb}</span>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-muted-foreground">Interdictions : G en 2025 · F en 2028 · E en 2034.</p>
          </CardContent>
        </Card>

        {/* Échéances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Échéances à venir</CardTitle>
          </CardHeader>
          <CardContent>
            {alertes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <p className="mt-2 text-sm font-medium">Aucune échéance</p>
                <p className="text-xs text-muted-foreground">Tout est en règle.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {alertes.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    {a.type === "destructive" ? (
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                    ) : (
                      <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{a.titre}</p>
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
