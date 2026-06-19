"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Download, Send, Building2, Receipt } from "lucide-react";
import { downloadQuittancePDF } from "@/lib/pdf";
import { useBiens, useLocataires } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import Link from "next/link";

export default function QuittancesPage() {
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const moisCourant = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  function genererToutes() {
    locataires.forEach((l) => {
      const b = biens.find((x) => x.id === l.bienId);
      if (!b) return;
      downloadQuittancePDF({
        mois: moisCourant,
        bailleurNom: "",
        bailleurAdresse: "",
        locataireNom: l.nom,
        bienAdresse: `${b.adresse}, ${b.ville}`,
        loyer: l.loyerMensuel,
        charges: b.charges,
      });
    });
  }

  function genererUne(locataireId: string) {
    const l = locataires.find((x) => x.id === locataireId);
    const b = l ? biens.find((x) => x.id === l.bienId) : undefined;
    if (!l || !b) return;
    downloadQuittancePDF({
      mois: moisCourant,
      bailleurNom: "",
      bailleurAdresse: "",
      locataireNom: l.nom,
      bienAdresse: `${b.adresse}, ${b.ville}`,
      loyer: l.loyerMensuel,
      charges: b.charges,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quittances"
        description="Génération mensuelle, distribution multi-canal (email, espace locataire, PDF)."
        badge="Module 5"
        actions={
          locataires.length > 0 ? (
            <>
              <Button variant="outline" onClick={genererToutes}>
                <Download className="h-4 w-4" /> Générer toutes (PDF)
              </Button>
              <Button>
                <Send className="h-4 w-4" /> Envoyer
              </Button>
            </>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitleInfo
            title={`Quittances du mois — ${moisCourant}`}
            hint="Une quittance par bail actif. Génération PDF immédiate, individuelle ou en lot."
          />
          <CardDescription>Génération PDF par locataire</CardDescription>
        </CardHeader>
        <CardContent>
          {locataires.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucun bail actif"
              message="Ajoutez un locataire pour générer des quittances."
              action={
                <Button asChild>
                  <Link href="/locataires">Ajouter un locataire</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y">
              {locataires.map((l) => {
                const b = biens.find((x) => x.id === l.bienId);
                return (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{l.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {b ? `${b.adresse}, ${b.ville}` : "—"} · {formatEUR(l.loyerMensuel)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => genererUne(l.id)}>
                      <Download className="h-4 w-4" /> Quittance PDF
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
