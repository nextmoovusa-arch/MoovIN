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
import { DonutChart, GroupedBarChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { AddBienDialog } from "@/components/biens/add-bien-dialog";
import { AnnonceDialog } from "@/components/biens/annonce-dialog";
import {
  useBiens,
  useLocataires,
  etatDuBien,
  loyerActifDuBien,
  rendementBrutDuBien,
  rendementNetDuBien,
  BienStored,
} from "@/lib/store";
import { formatEUR, formatPct } from "@/lib/utils";
import { Building2, Trash2, Megaphone, ChevronRight } from "lucide-react";
import Link from "next/link";

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-green-500", C: "bg-lime-500",
  D: "bg-yellow-500", E: "bg-orange-500", F: "bg-red-500", G: "bg-rose-600",
};

export default function BiensPage() {
  const [biens, setBiens] = useBiens();
  const [locataires] = useLocataires();

  function addBien(b: BienStored) {
    setBiens((s) => [b, ...s]);
  }

  function removeBien(id: string) {
    if (!confirm("Supprimer ce bien ? Cette action est irréversible.")) return;
    setBiens((s) => s.filter((b) => b.id !== id));
  }

  const repartitionParType = Object.entries(
    biens.reduce<Record<string, number>>((acc, b) => {
      acc[b.type] = (acc[b.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const dpePatrimoine = (["A", "B", "C", "D", "E", "F", "G"] as const).map((classe) => ({
    classe,
    nb: biens.filter((b) => b.dpe === classe).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes biens immobiliers"
        description="Vue d'ensemble du patrimoine. Cliquez sur Ajouter un bien pour étoffer le portefeuille."
        badge="Module 2"
        actions={<AddBienDialog onCreate={addBien} />}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Répartition par type"
              hint="Donut : nombre de biens par typologie (Studio, T1, T2, T3+). Aide à identifier la diversification."
            />
            <CardDescription>Studio, T1, T2, T3+</CardDescription>
          </CardHeader>
          <CardContent>
            {repartitionParType.length > 0 ? (
              <DonutChart data={repartitionParType} height={220} />
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Aucun bien.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo
              title="Classes DPE du patrimoine"
              hint={
                <>
                  <p>Nombre de biens par classe énergétique.</p>
                  <p className="mt-1"><strong>Calendrier d'interdiction :</strong> G en 2025, F en 2028, E en 2034.</p>
                </>
              }
            />
            <CardDescription>Seuils légaux : G interdit 2025, F 2028</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={dpePatrimoine}
              xKey="classe"
              series={[{ dataKey: "nb", name: "Nombre de biens" }]}
              height={220}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title={`Liste des biens (${biens.length})`}
            hint={
              <>
                <p>Colonnes <strong>État</strong>, <strong>Loyer</strong> et <strong>Rendement</strong> calculées automatiquement :</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li><strong>État</strong> ← locataire actif lié au bien</li>
                  <li><strong>Loyer</strong> ← bail en cours</li>
                  <li><strong>Rendement net</strong> = (loyer × 12 − charges − taxe) / (prix + notaire)</li>
                </ul>
              </>
            }
          />
          <CardDescription>Tableau avec sparklines + colonnes intelligentes</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {biens.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun bien. Cliquez sur « Ajouter un bien » pour commencer.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="py-2 pr-3 font-medium">Bien</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Surface</th>
                  <th className="py-2 pr-3 font-medium">DPE</th>
                  <th className="py-2 pr-3 font-medium">Loyer <span className="text-[10px] uppercase">auto</span></th>
                  <th className="py-2 pr-3 font-medium">Rendement net <span className="text-[10px] uppercase">auto</span></th>
                  <th className="py-2 pr-3 font-medium">État <span className="text-[10px] uppercase">auto</span></th>
                  <th className="py-2 pr-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {biens.map((b) => {
                  const loyer = loyerActifDuBien(b, locataires);
                  const rendNet = rendementNetDuBien(b, locataires);
                  const etat = etatDuBien(b, locataires);
                  const rendBadge =
                    rendNet <= 0 ? "secondary" : rendNet < 2 ? "destructive" : rendNet < 4 ? "warning" : "success";
                  const etatBadge =
                    etat === "Occupé" ? "success" : etat === "Vacant" ? "destructive" : "warning";

                  return (
                    <tr key={b.id} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-3">
                        <Link href={`/biens/${b.id}`} className="flex items-start gap-2 group">
                          {b.photos[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={b.photos[0]}
                              alt=""
                              className="h-10 w-10 rounded-md object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {b.adresse}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.ville} {b.codePostal ? `· ${b.codePostal}` : ""}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {b.type} <span className="text-xs">({b.nbPieces}p)</span>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{b.surface} m²</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[b.dpe]}`}
                        >
                          {b.dpe}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-medium">
                        {loyer > 0 ? formatEUR(loyer) : <span className="text-muted-foreground italic">—</span>}
                      </td>
                      <td className="py-3 pr-3">
                        {loyer > 0 ? (
                          <Badge variant={rendBadge as any}>{formatPct(rendNet)}</Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">à fixer</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={etatBadge as any}>{etat}</Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1">
                          <AnnonceDialog
                            bien={b}
                            loyerInitial={loyer || undefined}
                            trigger={
                              <Button variant="ghost" size="icon" aria-label="Créer une annonce" title="Créer une annonce">
                                <Megaphone className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Supprimer ce bien"
                            onClick={() => removeBien(b.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="ghost" size="icon" aria-label="Voir le détail" title="Voir le détail">
                            <Link href={`/biens/${b.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
