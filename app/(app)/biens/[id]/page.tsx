"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RadialGauge } from "@/components/charts/chart-kit";
import { AnnonceDialog } from "@/components/biens/annonce-dialog";
import {
  useBiens,
  useLocataires,
  etatDuBien,
  loyerActifDuBien,
  rendementBrutDuBien,
  rendementNetDuBien,
} from "@/lib/store";
import { formatEUR, formatPct } from "@/lib/utils";
import { ArrowLeft, Building2, Trash2, MapPin, User } from "lucide-react";

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-green-500", C: "bg-lime-500",
  D: "bg-yellow-500", E: "bg-orange-500", F: "bg-red-500", G: "bg-rose-600",
};

export default function BienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [biens, setBiens] = useBiens();
  const [locataires] = useLocataires();
  const [active, setActive] = React.useState(0);

  const bien = biens.find((b) => b.id === id);

  if (!bien) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bien introuvable" />
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="Ce bien n'existe pas"
              message="Il a peut-être été supprimé."
              action={
                <Button asChild>
                  <Link href="/biens">
                    <ArrowLeft className="h-4 w-4" /> Retour à mes biens
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const loyer = loyerActifDuBien(bien, locataires);
  const rendBrut = rendementBrutDuBien(bien, locataires);
  const rendNet = rendementNetDuBien(bien, locataires);
  const etat = etatDuBien(bien, locataires);
  const occupant = locataires.find((l) => l.bienId === bien.id);
  const invest = bien.prixAchat + (bien.fraisNotaire ?? Math.round(bien.prixAchat * 0.08));

  const etatBadge = etat === "Occupé" ? "success" : etat === "Vacant" ? "destructive" : "warning";

  function remove() {
    if (!confirm("Supprimer ce bien ? Cette action est irréversible.")) return;
    setBiens((s) => s.filter((b) => b.id !== id));
    router.push("/biens");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/biens">
            <ArrowLeft className="h-4 w-4" /> Mes biens
          </Link>
        </Button>
      </div>

      <PageHeader
        title={bien.adresse}
        description={`${bien.ville}${bien.codePostal ? ` · ${bien.codePostal}` : ""}`}
        actions={
          <>
            <AnnonceDialog bien={bien} loyerInitial={loyer || undefined} />
            <Button variant="outline" onClick={remove} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Galerie photos */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            {bien.photos.length > 0 ? (
              <>
                <div className="aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bien.photos[active]} alt="" className="h-full w-full object-cover" />
                </div>
                {bien.photos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {bien.photos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-10 w-10 mx-auto" />
                  <p className="mt-2 text-sm">Aucune photo</p>
                </div>
              </div>
            )}
          </Card>

          {bien.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bien.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Field label="Type" value={bien.type} />
                <Field label="Pièces" value={`${bien.nbPieces}`} />
                <Field label="Surface" value={`${bien.surface} m²`} />
                <Field
                  label="DPE"
                  value={
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[bien.dpe]}`}>
                      {bien.dpe}
                    </span>
                  }
                />
                <Field label="État" value={<Badge variant={etatBadge as any}>{etat}</Badge>} />
                <Field label="Prix au m²" value={bien.surface ? formatEUR(Math.round(bien.prixAchat / bien.surface)) : "—"} />
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : finances + locataire */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs</CardTitle>
              <CardDescription>Calculés en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <RadialGauge value={rendBrut} max={10} label="Rdt brut" suffix=" %" thresholds={[3, 5]} />
                <RadialGauge value={rendNet} max={8} label="Rdt net" suffix=" %" thresholds={[2, 4]} />
              </div>
              <dl className="space-y-2 text-sm">
                <Row label="Prix d'achat" value={formatEUR(bien.prixAchat)} />
                <Row label="Frais de notaire" value={formatEUR(bien.fraisNotaire ?? Math.round(bien.prixAchat * 0.08))} />
                <Row label="Investissement total" value={formatEUR(invest)} strong />
                <Row label="Taxe foncière / an" value={formatEUR(bien.taxeFonciere)} />
                <Row label="Charges / mois" value={formatEUR(bien.charges)} />
                <Row label="Loyer actuel" value={loyer > 0 ? formatEUR(loyer) : "—"} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Locataire</CardTitle>
            </CardHeader>
            <CardContent>
              {occupant ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{occupant.nom}</p>
                      <p className="text-xs text-muted-foreground">{occupant.email}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/locataires">Voir le bail</Link>
                  </Button>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={User}
                  title="Bien vacant"
                  message="Aucun locataire rattaché."
                  action={
                    <Button asChild size="sm">
                      <Link href="/locataires">Ajouter un locataire</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {bien.adresse}, {bien.ville}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-bold text-primary" : "font-medium"}>{value}</dd>
    </div>
  );
}
