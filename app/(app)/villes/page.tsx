"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label, NumberInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { GroupedBarChart } from "@/components/charts/chart-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVilles, VilleStored, newId } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import { MapPin, Plus, Trash2, Pencil } from "lucide-react";

const TENSIONS: NonNullable<VilleStored["tensionLocative"]>[] = ["Faible", "Moyenne", "Forte"];

const tensionVariant: Record<string, "secondary" | "warning" | "destructive"> = {
  Faible: "secondary",
  Moyenne: "warning",
  Forte: "destructive",
};

export default function VillesPage() {
  const [villes, setVilles] = useVilles();

  function upsert(v: VilleStored) {
    setVilles((s) => {
      const exists = s.some((x) => x.id === v.id);
      return exists ? s.map((x) => (x.id === v.id ? v : x)) : [v, ...s];
    });
  }
  function remove(id: string) {
    if (!confirm("Supprimer cette ville ?")) return;
    setVilles((s) => s.filter((v) => v.id !== id));
  }

  // Comparateur prix m² moyen
  const compareData = villes
    .filter((v) => v.prixM2Moyen)
    .map((v) => ({ ville: v.nom, prix: Math.round(v.prixM2Moyen!) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marché par ville"
        description="Votre base de connaissances marché : prix au m² bas / moyen / haut, loyers, tension locative — saisis et mis à jour par vos soins."
        badge="Veille marché"
        actions={<VilleDialog onSave={upsert} />}
      />

      {villes.length === 0 ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={MapPin}
              title="Aucune ville"
              message="Ajoutez une ville et renseignez ses prix au m² (bas, moyen, haut) et d'autres infos de marché."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {compareData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitleInfo title="Comparateur prix au m² moyen" hint="Prix moyen au m² que vous avez saisi pour chaque ville." />
                <CardDescription>Toutes vos villes suivies</CardDescription>
              </CardHeader>
              <CardContent>
                <GroupedBarChart data={compareData} xKey="ville" series={[{ dataKey: "prix", name: "€/m² moyen" }]} />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {villes.map((v) => (
              <Card key={v.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" /> {v.nom}
                      </p>
                      {v.codePostal && <p className="text-xs text-muted-foreground">{v.codePostal}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <VilleDialog
                        existing={v}
                        onSave={upsert}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Modifier"><Pencil className="h-4 w-4" /></Button>
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => remove(v.id)} className="text-muted-foreground hover:text-destructive" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Fourchette prix m² */}
                  <div className="rounded-lg border bg-elevated p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prix au m²</p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Bas</p>
                        <p className="font-semibold text-success">{v.prixM2Bas ? formatEUR(v.prixM2Bas) : "—"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Moyen</p>
                        <p className="font-bold text-lg text-primary">{v.prixM2Moyen ? formatEUR(v.prixM2Moyen) : "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Haut</p>
                        <p className="font-semibold text-destructive">{v.prixM2Haut ? formatEUR(v.prixM2Haut) : "—"}</p>
                      </div>
                    </div>
                    {v.prixM2Bas && v.prixM2Haut && v.prixM2Moyen && (
                      <FourchetteBar bas={v.prixM2Bas} moyen={v.prixM2Moyen} haut={v.prixM2Haut} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md border px-2 py-1.5">
                      <p className="text-[10px] uppercase text-muted-foreground">Loyer €/m²</p>
                      <p className="font-semibold">{v.loyerM2Moyen ? formatEUR(v.loyerM2Moyen) : "—"}</p>
                    </div>
                    <div className="rounded-md border px-2 py-1.5">
                      <p className="text-[10px] uppercase text-muted-foreground">Rdt moyen</p>
                      <p className="font-semibold">{v.rendementMoyen ? `${v.rendementMoyen.toFixed(1).replace(".", ",")} %` : "—"}</p>
                    </div>
                  </div>

                  {v.tensionLocative && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Tension locative :</span>
                      <Badge variant={tensionVariant[v.tensionLocative]}>{v.tensionLocative}</Badge>
                    </div>
                  )}

                  {v.notes && <p className="text-xs text-muted-foreground border-t pt-2">{v.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FourchetteBar({ bas, moyen, haut }: { bas: number; moyen: number; haut: number }) {
  const pct = haut > bas ? ((moyen - bas) / (haut - bas)) * 100 : 50;
  return (
    <div className="mt-2">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-success via-warning to-destructive">
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

function VilleDialog({
  existing,
  onSave,
  trigger,
}: {
  existing?: VilleStored;
  onSave: (v: VilleStored) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [v, setV] = React.useState<Partial<VilleStored>>(existing ?? {});

  React.useEffect(() => {
    if (open) setV(existing ?? {});
  }, [open, existing]);

  function submit() {
    if (!v.nom) return;
    onSave({
      id: existing?.id ?? newId("V"),
      nom: v.nom,
      codePostal: v.codePostal,
      prixM2Bas: v.prixM2Bas,
      prixM2Moyen: v.prixM2Moyen,
      prixM2Haut: v.prixM2Haut,
      loyerM2Moyen: v.loyerM2Moyen,
      rendementMoyen: v.rendementMoyen,
      tensionLocative: v.tensionLocative,
      notes: v.notes,
      dateMaj: new Date().toISOString(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> Ajouter une ville
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Modifier la ville" : "Ajouter une ville"}</DialogTitle>
          <DialogDescription>Renseignez les données de marché que vous connaissez. Tout est facultatif sauf le nom.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Ville</Label>
            <Input className="mt-1.5" placeholder="Lyon" value={v.nom ?? ""} onChange={(e) => setV((s) => ({ ...s, nom: e.target.value }))} />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input className="mt-1.5" placeholder="69000" value={v.codePostal ?? ""} onChange={(e) => setV((s) => ({ ...s, codePostal: e.target.value }))} />
          </div>
          <div>
            <Label>Prix m² bas (€)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 3000" value={v.prixM2Bas} onValueChange={(x) => setV((s) => ({ ...s, prixM2Bas: x }))} />
          </div>
          <div>
            <Label>Prix m² moyen (€)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 4500" value={v.prixM2Moyen} onValueChange={(x) => setV((s) => ({ ...s, prixM2Moyen: x }))} />
          </div>
          <div>
            <Label>Prix m² haut (€)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 6500" value={v.prixM2Haut} onValueChange={(x) => setV((s) => ({ ...s, prixM2Haut: x }))} />
          </div>
          <div>
            <Label>Loyer moyen (€/m²)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 14" value={v.loyerM2Moyen} onValueChange={(x) => setV((s) => ({ ...s, loyerM2Moyen: x }))} />
          </div>
          <div>
            <Label>Rendement moyen (%)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 4.5" value={v.rendementMoyen} onValueChange={(x) => setV((s) => ({ ...s, rendementMoyen: x }))} />
          </div>
          <div>
            <Label>Tension locative</Label>
            <select
              value={v.tensionLocative ?? ""}
              onChange={(e) => setV((s) => ({ ...s, tensionLocative: (e.target.value || undefined) as VilleStored["tensionLocative"] }))}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {TENSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea className="mt-1.5" placeholder="Quartiers porteurs, projets urbains, transports, à éviter…" value={v.notes ?? ""} onChange={(e) => setV((s) => ({ ...s, notes: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!v.nom}>{existing ? "Enregistrer" : "Ajouter"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
