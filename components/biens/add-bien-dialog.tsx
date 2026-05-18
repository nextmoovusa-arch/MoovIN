"use client";

import * as React from "react";
import { Plus, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { InfoHint } from "@/components/ui/info-hint";
import { BienStored, fileToDataURL, newId } from "@/lib/store";
import { formatEUR } from "@/lib/utils";

const DPE_CHOICES: BienStored["dpe"][] = ["A", "B", "C", "D", "E", "F", "G"];
const TYPE_CHOICES = ["Studio", "T1", "T2", "T3", "T4", "T5", "Maison"];

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-green-500", C: "bg-lime-500",
  D: "bg-yellow-500", E: "bg-orange-500", F: "bg-red-500", G: "bg-rose-600",
};

export function AddBienDialog({
  onCreate,
}: {
  onCreate: (bien: BienStored) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [b, setB] = React.useState<Partial<BienStored>>({
    type: "T2",
    nbPieces: 2,
    dpe: "D",
    photos: [],
  });

  function reset() {
    setB({ type: "T2", nbPieces: 2, dpe: "D", photos: [] });
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, 6).map(fileToDataURL));
    setB((s) => ({ ...s, photos: [...(s.photos ?? []), ...urls].slice(0, 6) }));
  }

  function removePhoto(i: number) {
    setB((s) => ({ ...s, photos: (s.photos ?? []).filter((_, idx) => idx !== i) }));
  }

  function submit() {
    if (!b.adresse || !b.ville || !b.surface || !b.prixAchat) return;
    const bien: BienStored = {
      id: newId("B"),
      adresse: b.adresse,
      ville: b.ville,
      codePostal: b.codePostal,
      type: b.type ?? "T2",
      nbPieces: b.nbPieces ?? 1,
      surface: b.surface,
      dpe: (b.dpe as BienStored["dpe"]) ?? "D",
      prixAchat: b.prixAchat,
      fraisNotaire: b.fraisNotaire ?? Math.round(b.prixAchat * 0.08),
      taxeFonciere: b.taxeFonciere ?? 0,
      charges: b.charges ?? 0,
      description: b.description,
      photos: b.photos ?? [],
      enTravaux: false,
    };
    onCreate(bien);
    reset();
    setOpen(false);
  }

  const rendementSimule =
    b.prixAchat && b.prixAchat > 0
      ? ((b.charges ?? 0) === 0
          ? null
          : null)
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Ajouter un bien
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter un bien immobilier</DialogTitle>
          <DialogDescription>
            Saisissez les caractéristiques. L'<strong>état</strong>, le <strong>loyer</strong> et la{" "}
            <strong>rentabilité</strong> seront calculés automatiquement à partir des autres données
            (locataire actif, prix d'achat, charges…).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photos */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5">
              <Label>Photos du bien</Label>
              <InfoHint title="Photos">Jusqu'à 6 photos (façade, pièces principales). Aide à la visualisation dans la liste et lors de la mise en location.</InfoHint>
            </div>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
              {(b.photos ?? []).map((p, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    aria-label="Supprimer la photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {(b.photos ?? []).length < 6 && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-input hover:border-primary/50 hover:bg-accent transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotos}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <Label>Adresse complète</Label>
            <Input
              className="mt-1.5"
              placeholder="ex : 12 rue de la République"
              value={b.adresse ?? ""}
              onChange={(e) => setB((s) => ({ ...s, adresse: e.target.value }))}
            />
          </div>
          <div>
            <Label>Ville</Label>
            <Input
              className="mt-1.5"
              placeholder="Lyon 1er"
              value={b.ville ?? ""}
              onChange={(e) => setB((s) => ({ ...s, ville: e.target.value }))}
            />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input
              className="mt-1.5"
              placeholder="69001"
              value={b.codePostal ?? ""}
              onChange={(e) => setB((s) => ({ ...s, codePostal: e.target.value }))}
            />
          </div>

          {/* Type et pièces */}
          <div>
            <Label>Type de bien</Label>
            <select
              value={b.type ?? "T2"}
              onChange={(e) => setB((s) => ({ ...s, type: e.target.value }))}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TYPE_CHOICES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Label>Nombre de pièces</Label>
              <InfoHint title="Nb de pièces">Pièces principales (hors cuisine, SDB, WC).</InfoHint>
            </div>
            <Input
              type="number"
              className="mt-1.5"
              min={1}
              max={20}
              value={b.nbPieces ?? 1}
              onChange={(e) => setB((s) => ({ ...s, nbPieces: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Surface habitable (m²)</Label>
            <Input
              type="number"
              className="mt-1.5"
              min={1}
              value={b.surface ?? ""}
              onChange={(e) => setB((s) => ({ ...s, surface: Number(e.target.value) }))}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Label>Classe DPE</Label>
              <InfoHint title="DPE">Performance énergétique. Rappel : G interdit à la location depuis 2025, F en 2028.</InfoHint>
            </div>
            <div className="mt-1.5 flex gap-1">
              {DPE_CHOICES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setB((s) => ({ ...s, dpe: c }))}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[c]} ${b.dpe === c ? "ring-2 ring-offset-2 ring-foreground" : "opacity-60 hover:opacity-100"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Financier */}
          <div>
            <Label>Prix d'achat (€)</Label>
            <Input
              type="number"
              className="mt-1.5"
              step={1000}
              value={b.prixAchat ?? ""}
              onChange={(e) => setB((s) => ({ ...s, prixAchat: Number(e.target.value) }))}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Label>Frais de notaire (€)</Label>
              <InfoHint title="Frais de notaire">7-8 % du prix dans l'ancien, 2-3 % dans le neuf. Pré-rempli automatiquement.</InfoHint>
            </div>
            <Input
              type="number"
              className="mt-1.5"
              step={100}
              placeholder={b.prixAchat ? String(Math.round(b.prixAchat * 0.08)) : "0"}
              value={b.fraisNotaire ?? ""}
              onChange={(e) => setB((s) => ({ ...s, fraisNotaire: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Taxe foncière (€/an)</Label>
            <Input
              type="number"
              className="mt-1.5"
              step={50}
              value={b.taxeFonciere ?? ""}
              onChange={(e) => setB((s) => ({ ...s, taxeFonciere: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Charges mensuelles (€)</Label>
            <Input
              type="number"
              className="mt-1.5"
              step={10}
              value={b.charges ?? ""}
              onChange={(e) => setB((s) => ({ ...s, charges: Number(e.target.value) }))}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Description / notes</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Balcon, ascenseur, parking, copropriété…"
              value={b.description ?? ""}
              onChange={(e) => setB((s) => ({ ...s, description: e.target.value }))}
            />
          </div>

          {/* Aperçu intelligent */}
          <div className="md:col-span-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Champs calculés automatiquement
              </p>
              <InfoHint title="Champs intelligents">
                <p>
                  Ces champs ne sont jamais saisis manuellement.
                </p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li><strong>État</strong> ← Occupé si un locataire est lié au bien, sinon Vacant (ou Travaux si vous l'indiquez).</li>
                  <li><strong>Loyer mensuel</strong> ← Vient du bail du locataire en place.</li>
                  <li><strong>Rendement</strong> ← (Loyer annuel − charges) / Investissement total.</li>
                </ul>
              </InfoHint>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-background p-2 border">
                <p className="text-xs text-muted-foreground">État (auto)</p>
                <p className="font-semibold">Vacant <span className="text-xs font-normal text-muted-foreground">(aucun locataire pour l'instant)</span></p>
              </div>
              <div className="rounded-md bg-background p-2 border">
                <p className="text-xs text-muted-foreground">Loyer mensuel (auto)</p>
                <p className="font-semibold">— <span className="text-xs font-normal text-muted-foreground">à fixer via bail</span></p>
              </div>
              <div className="rounded-md bg-background p-2 border">
                <p className="text-xs text-muted-foreground">Rendement brut estimé</p>
                <p className="font-semibold text-muted-foreground">
                  {b.prixAchat ? <em>après mise en location</em> : "—"}
                </p>
              </div>
            </div>
            {b.prixAchat && b.fraisNotaire !== undefined && (
              <p className="mt-3 text-xs text-muted-foreground">
                Investissement total estimé :{" "}
                <strong className="text-primary">
                  {formatEUR(b.prixAchat + (b.fraisNotaire ?? Math.round(b.prixAchat * 0.08)))}
                </strong>{" "}
                (prix + notaire)
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={submit}
            disabled={!b.adresse || !b.ville || !b.surface || !b.prixAchat}
          >
            Ajouter le bien
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
