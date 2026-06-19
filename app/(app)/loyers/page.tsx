"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { DonutChart, GroupedBarChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBiens, useLocataires, loyerActifDuBien } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import { Building2, Euro } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function LoyersPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  // Paiements réels enregistrés via le portail locataire
  const [paiements, setPaiements] = React.useState<Record<string, { mois: string; montant: number }[]>>({});
  React.useEffect(() => {
    const out: Record<string, { mois: string; montant: number }[]> = {};
    for (const l of locataires) {
      try {
        const raw = window.localStorage.getItem(`moovin.paiements.${l.id}`);
        out[l.id] = raw ? JSON.parse(raw) : [];
      } catch {
        out[l.id] = [];
      }
    }
    setPaiements(out);
  }, [locataires]);

  const moisLong = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // Statuts du mois courant par bail actif
  const statuts = locataires.map((l) => {
    const paye = (paiements[l.id] ?? []).some((p) => p.mois?.toLowerCase() === moisLong.toLowerCase());
    return { locataire: l, paye };
  });
  const nbPayes = statuts.filter((s) => s.paye).length;
  const nbImpayes = statuts.length - nbPayes;

  const donutStatuts = [
    { name: "Payé", value: nbPayes },
    { name: "En attente", value: nbImpayes },
  ].filter((x) => x.value > 0);

  // Loyers dus vs encaissés (mois courant)
  const loyersDus = biens.reduce((s, b) => s + loyerActifDuBien(b, locataires), 0);
  const loyersEncaisses = statuts
    .filter((s) => s.paye)
    .reduce((acc, s) => acc + s.locataire.loyerMensuel, 0);

  const barData = [
    { mois: moisLong, prevu: loyersDus, encaisse: loyersEncaisses },
  ];

  if (locataires.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Suivi des loyers & impayés" description="Détection instantanée des anomalies et tendances de recouvrement." badge="Module 4" />
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="Aucun bail actif"
              message="Ajoutez un locataire à un bien pour suivre ses loyers et encaissements."
              action={
                <Button asChild>
                  <Link href="/locataires">Ajouter un locataire</Link>
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
      <PageHeader title="Suivi des loyers & impayés" description="Détection instantanée des anomalies et tendances de recouvrement." badge="Module 4" />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Loyers dus ({moisLong})</p>
            <p className="mt-2 text-2xl font-bold">{formatEUR(loyersDus)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Encaissés</p>
            <p className="mt-2 text-2xl font-bold text-success">{formatEUR(loyersEncaisses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reste à percevoir</p>
            <p className="mt-2 text-2xl font-bold text-destructive">{formatEUR(loyersDus - loyersEncaisses)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo title="Statuts de paiement" hint="Répartition des baux actifs payés / en attente pour le mois en cours." />
            <CardDescription>Mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {donutStatuts.length > 0 ? (
              <DonutChart data={donutStatuts} />
            ) : (
              <EmptyState compact message="Aucun paiement enregistré ce mois-ci." />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo title="Suivi par locataire" hint="Statut du loyer du mois courant. Le paiement est enregistré quand le locataire paie via son portail." />
            <CardDescription>{moisLong}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {statuts.map((s) => {
                const bien = biens.find((b) => b.id === s.locataire.bienId);
                return (
                  <li key={s.locataire.id} className="flex items-center gap-3 py-3">
                    <Euro className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.locataire.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {bien ? `${bien.adresse}, ${bien.ville}` : "—"}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{formatEUR(s.locataire.loyerMensuel)}</span>
                    <Badge variant={s.paye ? "success" : "warning"}>{s.paye ? "Payé" : "En attente"}</Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo title="Loyers prévus vs encaissés" hint="Comparaison du mois courant : différence = montant restant à percevoir." />
          <CardDescription>Mois en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupedBarChart
            data={barData}
            xKey="mois"
            series={[
              { dataKey: "prevu", name: "Prévu", color: "hsl(var(--muted-foreground))" },
              { dataKey: "encaisse", name: "Encaissé" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
