"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useBiens, useLocataires, loyerActifDuBien } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import { Building2, Euro, Wallet, AlertCircle, Landmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function LoyersPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  // Paiements réels enregistrés via le portail locataire
  const [paiements, setPaiements] = React.useState<Record<string, { mois: string }[]>>({});
  React.useEffect(() => {
    const out: Record<string, { mois: string }[]> = {};
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

  const statuts = locataires.map((l) => {
    const paye = (paiements[l.id] ?? []).some((p) => p.mois?.toLowerCase() === moisLong.toLowerCase());
    return { locataire: l, paye };
  });
  const nbPayes = statuts.filter((s) => s.paye).length;

  const loyersDus = biens.reduce((s, b) => s + loyerActifDuBien(b, locataires), 0);
  const loyersEncaisses = statuts.filter((s) => s.paye).reduce((acc, s) => acc + s.locataire.loyerMensuel, 0);
  const reste = loyersDus - loyersEncaisses;
  const tauxRecouv = loyersDus > 0 ? (loyersEncaisses / loyersDus) * 100 : 0;

  if (locataires.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Suivi des loyers" description="Vérifiez en un coup d'œil quels loyers sont rentrés." badge="Module 4" />
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={Building2}
              title="Aucun bail actif"
              message="Ajoutez un locataire à un bien pour suivre ses loyers."
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
      <PageHeader
        title="Suivi des loyers"
        description={`Encaissements de ${moisLong}.`}
        badge="Module 4"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/banque">
              <Landmark className="h-4 w-4" /> Rapprochement bancaire
            </Link>
          </Button>
        }
      />

      {/* Grands chiffres */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Loyers attendus" animateValue={loyersDus} format={formatEUR} icon={Euro} accent="primary" hint={moisLong} />
        <KpiCard label="Encaissés" animateValue={loyersEncaisses} format={formatEUR} icon={Wallet} accent="success" hint={`${nbPayes}/${statuts.length} loyers`} />
        <KpiCard
          label="Reste à percevoir"
          animateValue={reste}
          format={formatEUR}
          icon={AlertCircle}
          accent={reste > 0 ? "warning" : "success"}
          hint={`${Math.round(tauxRecouv)} % recouvré`}
        />
      </section>

      {/* Liste par locataire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail par locataire</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {statuts.map((s) => {
              const bien = biens.find((b) => b.id === s.locataire.bienId);
              return (
                <li key={s.locataire.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${s.paye ? "bg-success/10" : "bg-warning/10"}`}
                  >
                    {s.paye ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.locataire.nom}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {bien ? `${bien.adresse}, ${bien.ville}` : "—"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatEUR(s.locataire.loyerMensuel)}</span>
                  <Badge variant={s.paye ? "success" : "warning"}>{s.paye ? "Reçu" : "En attente"}</Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
