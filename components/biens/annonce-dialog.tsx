"use client";

import * as React from "react";
import { Megaphone, Copy, Check, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea, Label, NumberInput } from "@/components/ui/input";
import { genererAnnonce } from "@/lib/annonce";
import { BienStored } from "@/lib/store";

export function AnnonceDialog({
  bien,
  loyerInitial,
  trigger,
}: {
  bien: BienStored;
  loyerInitial?: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [loyer, setLoyer] = React.useState<number | undefined>(loyerInitial);
  const [meuble, setMeuble] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const texte = genererAnnonce(bien, { loyer: loyer ?? 0, meuble });

  function copy() {
    navigator.clipboard.writeText(texte);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([texte], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Annonce-${bien.ville}-${bien.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Megaphone className="h-4 w-4" /> Créer une annonce
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Annonce — {bien.adresse}</DialogTitle>
          <DialogDescription>
            Texte généré automatiquement, à copier-coller sur Leboncoin, SeLoger ou votre vitrine.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Loyer mensuel (€ HC)</Label>
            <NumberInput className="mt-1.5" placeholder="Ex : 850" value={loyer} onValueChange={setLoyer} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={meuble}
                onChange={(e) => setMeuble(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Logement meublé
            </label>
          </div>
        </div>

        <Textarea className="font-mono text-xs h-[280px]" value={texte} readOnly />

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={download}>
            <Download className="h-4 w-4" /> .TXT
          </Button>
          <Button onClick={copy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copier l'annonce
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
