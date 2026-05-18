"use client";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HorizontalBarChart, DonutChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { AddLocataireDialog } from "@/components/locataires/add-locataire-dialog";
import { LeaseGeneratorDialog } from "@/components/locataires/lease-generator-dialog";
import { useBiens, useLocataires, LocataireStored } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import { Mail, Phone, User, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

const motifsDepart = [
  { name: "Fin naturelle", value: 12 },
  { name: "Rupture anticipée", value: 4 },
  { name: "Mutation", value: 2 },
  { name: "Expulsion", value: 1 },
];

export default function LocatairesPage() {
  const [biens] = useBiens();
  const [locataires, setLocataires] = useLocataires();

  function addLocataire(l: LocataireStored) {
    setLocataires((s) => [l, ...s.filter((x) => x.bienId !== l.bienId)]); // un seul actif par bien
  }

  function removeLocataire(id: string) {
    if (!confirm("Supprimer ce locataire ? Son bail sera clos et le bien passera en Vacant.")) return;
    setLocataires((s) => s.filter((l) => l.id !== id));
  }

  // Pyramide durées calculée à partir des locataires actifs
  const tranches = [
    { tranche: "0-6 mois", min: 0, max: 6 },
    { tranche: "6-12 mois", min: 6, max: 12 },
    { tranche: "1-2 ans", min: 12, max: 24 },
    { tranche: "2-3 ans", min: 24, max: 36 },
    { tranche: "3 ans+", min: 36, max: Infinity },
  ];
  const pyramide = tranches.map((t) => ({
    tranche: t.tranche,
    nb: locataires.filter((l) => {
      const m = monthsSince(l.dateEntree);
      return m >= t.min && m < t.max;
    }).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locataires & Baux"
        description="Gérez vos locataires actifs : ajout / suppression rapide, génération de bail pré-rempli depuis le modèle."
        badge="Module 3"
        actions={<AddLocataireDialog biens={biens} onCreate={addLocataire} />}
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Pyramide des durées d'occupation"
              hint="Histogramme par tranche. Beaucoup de courtes durées = forte rotation = vacances locatives plus fréquentes à gérer."
            />
            <CardDescription>Calculée depuis la date d'entrée des locataires actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={pyramide} xKey="nb" yKey="tranche" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Motifs de départ (historique)"
              hint="Répartition : fin naturelle, rupture anticipée, mutation, expulsion. Part élevée d'expulsions = revoir le scoring des candidats."
            />
            <CardDescription>Tous biens confondus, depuis le début</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={motifsDepart} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title={`Locataires actifs (${locataires.length})`}
            hint={
              <>
                <p>Liste des baux en cours. Pour chaque locataire :</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li>Bouton <strong>Générer le bail</strong> → modèle pré-rempli automatiquement</li>
                  <li>Bouton <strong>Supprimer</strong> → clôt le bail, le bien repasse en Vacant</li>
                  <li>Lien <strong>Portail</strong> → simule l'accès locataire à son espace</li>
                </ul>
              </>
            }
          />
          <CardDescription>CRUD + génération de bail pré-rempli</CardDescription>
        </CardHeader>
        <CardContent>
          {locataires.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun locataire actif. Cliquez sur « Ajouter un locataire ».
            </p>
          ) : (
            <ul className="divide-y">
              {locataires.map((l) => {
                const bien = biens.find((b) => b.id === l.bienId);
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{l.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {bien ? `${bien.adresse}, ${bien.ville}` : "Bien introuvable"}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {l.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {l.telephone || "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatEUR(l.loyerMensuel)} /mois</p>
                      <Badge variant={l.scoreFiabilite >= 90 ? "success" : "warning"}>
                        Score {l.scoreFiabilite}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {bien && <LeaseGeneratorDialog bien={bien} locataire={l} />}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        title="Voir l'espace locataire"
                      >
                        <Link href={`/portail?l=${l.id}`}>
                          <ExternalLink className="h-4 w-4" /> Portail
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer ce locataire"
                        onClick={() => removeLocataire(l.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

function monthsSince(iso: string): number {
  const d = new Date(iso);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
