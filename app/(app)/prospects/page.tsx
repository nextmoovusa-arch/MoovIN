"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label, NumberInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProspects, ProspectStored, newId, prixM2Prospect, fileToDataURL } from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import { Target, Plus, Trash2, ExternalLink, Upload, X, MapPin } from "lucide-react";

const TYPES = ["Appartement", "Studio", "Maison", "Immeuble", "Parking", "Local commercial"];
const DPE = ["A", "B", "C", "D", "E", "F", "G", "NC"] as const;
const STATUTS: ProspectStored["statut"][] = ["À étudier", "Visite prévue", "Offre faite", "Écarté", "Acheté"];

const statutVariant: Record<ProspectStored["statut"], "default" | "warning" | "success" | "destructive" | "secondary"> = {
  "À étudier": "secondary",
  "Visite prévue": "warning",
  "Offre faite": "default",
  Écarté: "destructive",
  Acheté: "success",
};

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500",
  E: "bg-orange-500", F: "bg-red-500", G: "bg-rose-600", NC: "bg-muted-foreground",
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useProspects();

  function add(p: ProspectStored) {
    setProspects((s) => [p, ...s]);
  }
  function remove(id: string) {
    if (!confirm("Supprimer ce prospect ?")) return;
    setProspects((s) => s.filter((p) => p.id !== id));
  }
  function setStatut(id: string, statut: ProspectStored["statut"]) {
    setProspects((s) => s.map((p) => (p.id === id ? { ...p, statut } : p)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospection"
        description="Vos biens repérés à l'achat : annonces, prix, DPE, notes — pour comparer et décider."
        badge="Pipeline d'acquisition"
        actions={<AddProspectDialog onCreate={add} />}
      />

      {prospects.length === 0 ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Target}
              title="Aucun prospect"
              message="Ajoutez un bien repéré (lien d'annonce, prix, surface, DPE, notes) pour le suivre et le comparer."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {prospects.map((p) => {
            const pm2 = prixM2Prospect(p);
            const rendementBrut =
              p.prix && p.loyerEstime ? ((p.loyerEstime * 12) / p.prix) * 100 : null;
            return (
              <Card key={p.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video bg-muted relative">
                  {p.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photos[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <select
                      value={p.statut}
                      onChange={(e) => setStatut(p.id, e.target.value as ProspectStored["statut"])}
                      className="rounded-md border bg-background/90 backdrop-blur px-2 py-1 text-xs font-medium shadow-sm"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {p.dpe && (
                    <span className={`absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[p.dpe]}`}>
                      {p.dpe}
                    </span>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.titre}</p>
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {p.ville} {p.codePostal ? `· ${p.codePostal}` : ""}
                      </p>
                    </div>
                    <Badge variant={statutVariant[p.statut]}>{p.statut}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <Stat label="Prix" value={p.prix ? formatEUR(p.prix) : "—"} />
                    <Stat label="Surface" value={p.surface ? `${p.surface} m²` : "—"} />
                    <Stat label="Prix / m²" value={pm2 ? formatEUR(Math.round(pm2)) : "—"} />
                    <Stat
                      label="Rdt brut estimé"
                      value={rendementBrut ? `${rendementBrut.toFixed(1).replace(".", ",")} %` : "—"}
                      highlight={rendementBrut ? (rendementBrut >= 5 ? "success" : rendementBrut < 3 ? "destructive" : "warning") : undefined}
                    />
                  </div>

                  {p.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1 border-t pt-2">{p.notes}</p>
                  )}

                  <div className="mt-auto pt-2 flex items-center gap-2">
                    {p.lienAnnonce && (
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={p.lienAnnonce} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" /> Annonce
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(p.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "success" | "warning" | "destructive";
}) {
  const cls =
    highlight === "success" ? "text-success" : highlight === "warning" ? "text-warning" : highlight === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-md border bg-elevated px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${cls}`}>{value}</p>
    </div>
  );
}

function AddProspectDialog({ onCreate }: { onCreate: (p: ProspectStored) => void }) {
  const [open, setOpen] = React.useState(false);
  const [p, setP] = React.useState<Partial<ProspectStored>>({
    typeBien: "Appartement",
    dpe: "NC",
    statut: "À étudier",
    photos: [],
  });

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, 6).map(fileToDataURL));
    setP((s) => ({ ...s, photos: [...(s.photos ?? []), ...urls].slice(0, 6) }));
  }

  function submit() {
    if (!p.titre || !p.ville) return;
    onCreate({
      id: newId("P"),
      titre: p.titre,
      typeBien: p.typeBien ?? "Appartement",
      ville: p.ville,
      codePostal: p.codePostal,
      prix: p.prix,
      surface: p.surface,
      nbPieces: p.nbPieces,
      dpe: (p.dpe as ProspectStored["dpe"]) ?? "NC",
      loyerEstime: p.loyerEstime,
      lienAnnonce: p.lienAnnonce,
      statut: (p.statut as ProspectStored["statut"]) ?? "À étudier",
      notes: p.notes,
      photos: p.photos ?? [],
      dateAjout: new Date().toISOString(),
    });
    setP({ typeBien: "Appartement", dpe: "NC", statut: "À étudier", photos: [] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Ajouter un prospect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un bien en prospection</DialogTitle>
          <DialogDescription>
            Collez le lien de l'annonce et les infos clés. Le prix au m² et le rendement brut estimé
            sont calculés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Titre / intitulé</Label>
            <Input className="mt-1.5" placeholder="Ex : T2 lumineux proche métro" value={p.titre ?? ""} onChange={(e) => setP((s) => ({ ...s, titre: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Lien de l'annonce</Label>
            <Input className="mt-1.5" placeholder="https://www.leboncoin.fr/…" value={p.lienAnnonce ?? ""} onChange={(e) => setP((s) => ({ ...s, lienAnnonce: e.target.value }))} />
          </div>
          <div>
            <Label>Type de bien</Label>
            <select value={p.typeBien} onChange={(e) => setP((s) => ({ ...s, typeBien: e.target.value }))} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Statut</Label>
            <select value={p.statut} onChange={(e) => setP((s) => ({ ...s, statut: e.target.value as ProspectStored["statut"] }))} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {STATUTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Ville</Label>
            <Input className="mt-1.5" placeholder="Lyon" value={p.ville ?? ""} onChange={(e) => setP((s) => ({ ...s, ville: e.target.value }))} />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input className="mt-1.5" placeholder="69003" value={p.codePostal ?? ""} onChange={(e) => setP((s) => ({ ...s, codePostal: e.target.value }))} />
          </div>
          <div>
            <Label>Prix (€)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 180000" value={p.prix} onValueChange={(v) => setP((s) => ({ ...s, prix: v }))} />
          </div>
          <div>
            <Label>Surface (m²)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 45" value={p.surface} onValueChange={(v) => setP((s) => ({ ...s, surface: v }))} />
          </div>
          <div>
            <Label>Nombre de pièces</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 2" value={p.nbPieces} onValueChange={(v) => setP((s) => ({ ...s, nbPieces: v }))} />
          </div>
          <div>
            <Label>Loyer estimé (€/mois)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 750" value={p.loyerEstime} onValueChange={(v) => setP((s) => ({ ...s, loyerEstime: v }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Classe DPE</Label>
            <div className="mt-1.5 flex gap-1 flex-wrap">
              {DPE.map((c) => (
                <button type="button" key={c} onClick={() => setP((s) => ({ ...s, dpe: c }))} className={`flex h-9 w-9 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[c]} ${p.dpe === c ? "ring-2 ring-offset-2 ring-foreground" : "opacity-60 hover:opacity-100"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea className="mt-1.5" placeholder="Points forts, travaux à prévoir, négociation possible…" value={p.notes ?? ""} onChange={(e) => setP((s) => ({ ...s, notes: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Photos</Label>
            <div className="mt-1.5 grid grid-cols-4 md:grid-cols-6 gap-2">
              {(p.photos ?? []).map((ph, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setP((s) => ({ ...s, photos: (s.photos ?? []).filter((_, idx) => idx !== i) }))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {(p.photos ?? []).length < 6 && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-input hover:border-primary/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!p.titre || !p.ville}>Ajouter le prospect</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
