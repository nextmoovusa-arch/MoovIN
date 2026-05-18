"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { InfoHint } from "@/components/ui/info-hint";
import { BienStored, LocataireStored, newId } from "@/lib/store";

export function AddLocataireDialog({
  biens,
  onCreate,
}: {
  biens: BienStored[];
  onCreate: (l: LocataireStored) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [l, setL] = React.useState<Partial<LocataireStored>>({
    dureeBailAnnees: 3,
    scoreFiabilite: 90,
    dateEntree: new Date().toISOString().slice(0, 10),
  });

  function submit() {
    if (!l.nom || !l.email || !l.bienId || !l.loyerMensuel) return;
    const newLocataire: LocataireStored = {
      id: newId("L"),
      nom: l.nom,
      email: l.email,
      telephone: l.telephone ?? "",
      bienId: l.bienId,
      dateEntree: l.dateEntree ?? new Date().toISOString().slice(0, 10),
      dureeBailAnnees: l.dureeBailAnnees ?? 3,
      loyerMensuel: l.loyerMensuel,
      depotGarantie: l.depotGarantie ?? l.loyerMensuel * 2,
      scoreFiabilite: l.scoreFiabilite ?? 90,
    };
    onCreate(newLocataire);
    setL({
      dureeBailAnnees: 3,
      scoreFiabilite: 90,
      dateEntree: new Date().toISOString().slice(0, 10),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Ajouter un locataire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un locataire</DialogTitle>
          <DialogDescription>
            En attachant un locataire à un bien, ce dernier passe automatiquement en{" "}
            <strong>Occupé</strong> et le loyer du bail devient son loyer en cours.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Nom complet</Label>
            <Input
              className="mt-1.5"
              placeholder="Jean Dupont"
              value={l.nom ?? ""}
              onChange={(e) => setL((s) => ({ ...s, nom: e.target.value }))}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              className="mt-1.5"
              placeholder="jean.dupont@email.com"
              value={l.email ?? ""}
              onChange={(e) => setL((s) => ({ ...s, email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              className="mt-1.5"
              placeholder="06 12 34 56 78"
              value={l.telephone ?? ""}
              onChange={(e) => setL((s) => ({ ...s, telephone: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5">
              <Label>Bien loué</Label>
              <InfoHint title="Bien loué">Le bien sélectionné passera en « Occupé ». Un bien ne peut accueillir qu'un seul bail actif à la fois.</InfoHint>
            </div>
            <select
              value={l.bienId ?? ""}
              onChange={(e) => setL((s) => ({ ...s, bienId: e.target.value }))}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— Sélectionner un bien —</option>
              {biens.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.type} · {b.adresse}, {b.ville}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Loyer mensuel (€)</Label>
            <Input
              type="number"
              className="mt-1.5"
              step={10}
              value={l.loyerMensuel ?? ""}
              onChange={(e) => setL((s) => ({ ...s, loyerMensuel: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Dépôt de garantie (€)</Label>
            <Input
              type="number"
              className="mt-1.5"
              step={50}
              placeholder={l.loyerMensuel ? String(l.loyerMensuel * 2) : ""}
              value={l.depotGarantie ?? ""}
              onChange={(e) => setL((s) => ({ ...s, depotGarantie: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Date d'entrée</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={l.dateEntree ?? ""}
              onChange={(e) => setL((s) => ({ ...s, dateEntree: e.target.value }))}
            />
          </div>
          <div>
            <Label>Durée du bail (ans)</Label>
            <Input
              type="number"
              className="mt-1.5"
              min={1}
              max={9}
              value={l.dureeBailAnnees ?? 3}
              onChange={(e) => setL((s) => ({ ...s, dureeBailAnnees: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!l.nom || !l.email || !l.bienId || !l.loyerMensuel}>
            Créer & passer le bien en Occupé
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
