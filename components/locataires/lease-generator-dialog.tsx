"use client";

import * as React from "react";
import { FileText, Download, Copy, Check } from "lucide-react";
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
import {
  generateLeaseText,
  LEASE_TEMPLATES,
  LeaseTemplateId,
  LeaseInputs,
} from "@/lib/lease-template";
import { BienStored, LocataireStored } from "@/lib/store";

export function LeaseGeneratorDialog({
  bien,
  locataire,
  defaultBailleurNom = "",
  defaultBailleurAdresse = "",
}: {
  bien: BienStored;
  locataire: LocataireStored;
  defaultBailleurNom?: string;
  defaultBailleurAdresse?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [tplId, setTplId] = React.useState<LeaseTemplateId>("vide-non-meuble");
  const [bailleurNom, setBailleurNom] = React.useState(defaultBailleurNom);
  const [bailleurAdresse, setBailleurAdresse] = React.useState(defaultBailleurAdresse);
  const [copied, setCopied] = React.useState(false);

  const inputs: LeaseInputs = {
    bailleurNom,
    bailleurAdresse,
    locataireNom: locataire.nom,
    locataireEmail: locataire.email,
    bienAdresse: `${bien.adresse}, ${bien.ville}${bien.codePostal ? " " + bien.codePostal : ""}`,
    bienType: `${bien.type} (${bien.nbPieces} pièce${bien.nbPieces > 1 ? "s" : ""})`,
    bienSurface: bien.surface,
    loyerMensuel: locataire.loyerMensuel,
    charges: bien.charges,
    depotGarantie: locataire.depotGarantie,
    dateDebut: locataire.dateEntree,
    dureeAnnees: locataire.dureeBailAnnees,
  };

  const leaseText = generateLeaseText(tplId, inputs);

  function copy() {
    navigator.clipboard.writeText(leaseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    const blob = new Blob([leaseText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bail-${locataire.nom.replace(/\s+/g, "_")}-${bien.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="h-4 w-4" /> Générer le bail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Générer le bail — {locataire.nom}</DialogTitle>
          <DialogDescription>
            Modèle pré-rempli depuis les informations du bien et du locataire.
            Vous pouvez ajuster les infos du bailleur puis télécharger.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Modèle de bail</Label>
            <select
              value={tplId}
              onChange={(e) => setTplId(e.target.value as LeaseTemplateId)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LEASE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {LEASE_TEMPLATES.find((t) => t.id === tplId)?.description}
            </p>
          </div>
          <div>
            <Label>Nom du bailleur</Label>
            <Input
              className="mt-1.5"
              placeholder="Votre nom"
              value={bailleurNom}
              onChange={(e) => setBailleurNom(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Adresse du bailleur</Label>
            <Input
              className="mt-1.5"
              placeholder="Votre adresse postale"
              value={bailleurAdresse}
              onChange={(e) => setBailleurAdresse(e.target.value)}
            />
          </div>
        </div>

        <Textarea
          className="font-mono text-xs h-[360px]"
          value={leaseText}
          readOnly
        />

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={copy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copier
              </>
            )}
          </Button>
          <Button onClick={downloadTxt}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
