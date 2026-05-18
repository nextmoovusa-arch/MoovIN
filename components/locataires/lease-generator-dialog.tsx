"use client";

import * as React from "react";
import { FileText, Download, RotateCcw, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  generateLeaseArticles,
  LEASE_TEMPLATES,
  LeaseTemplateId,
  LeaseInputs,
  LeaseArticle,
  articlesToText,
} from "@/lib/lease-template";
import { downloadPdf } from "@/lib/pdf";
import { useLocalStorage } from "@/lib/storage";
import { BienStored, LocataireStored } from "@/lib/store";

type StoredLease = {
  template: LeaseTemplateId;
  bailleurNom: string;
  bailleurAdresse: string;
  bailleurEmail: string;
  indexIRL: string;
  zoneTendue: boolean;
  honoraires: number;
  articles: LeaseArticle[];
};

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

  // Bail persisté par locataire
  const [stored, setStored] = useLocalStorage<StoredLease | null>(
    `moovin.bail.${locataire.id}`,
    null,
  );

  // Source de vérité affichée
  const [template, setTemplate] = React.useState<LeaseTemplateId>("vide-non-meuble");
  const [bailleurNom, setBailleurNom] = React.useState(defaultBailleurNom);
  const [bailleurAdresse, setBailleurAdresse] = React.useState(defaultBailleurAdresse);
  const [bailleurEmail, setBailleurEmail] = React.useState("");
  const [indexIRL, setIndexIRL] = React.useState("");
  const [zoneTendue, setZoneTendue] = React.useState(false);
  const [honoraires, setHonoraires] = React.useState(0);
  const [articles, setArticles] = React.useState<LeaseArticle[]>([]);
  const [openArticle, setOpenArticle] = React.useState<string | null>("1");

  // Hydratation : si bail persisté, on le recharge
  React.useEffect(() => {
    if (stored) {
      setTemplate(stored.template);
      setBailleurNom(stored.bailleurNom);
      setBailleurAdresse(stored.bailleurAdresse);
      setBailleurEmail(stored.bailleurEmail);
      setIndexIRL(stored.indexIRL);
      setZoneTendue(stored.zoneTendue);
      setHonoraires(stored.honoraires);
      setArticles(stored.articles);
    } else {
      regenerate(template, {
        bailleurNom: defaultBailleurNom,
        bailleurAdresse: defaultBailleurAdresse,
        bailleurEmail: "",
        indexIRL: "",
        zoneTendue: false,
        honoraires: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildInputs(extras: {
    bailleurNom: string;
    bailleurAdresse: string;
    bailleurEmail: string;
    indexIRL: string;
    zoneTendue: boolean;
    honoraires: number;
  }): LeaseInputs {
    return {
      bailleurNom: extras.bailleurNom,
      bailleurAdresse: extras.bailleurAdresse,
      bailleurEmail: extras.bailleurEmail,
      locataireNom: locataire.nom,
      locataireEmail: locataire.email,
      locataireTelephone: locataire.telephone,
      bienAdresse: `${bien.adresse}, ${bien.ville}${bien.codePostal ? " " + bien.codePostal : ""}`,
      bienType: bien.type,
      bienSurface: bien.surface,
      bienNbPieces: bien.nbPieces,
      loyerMensuel: locataire.loyerMensuel,
      charges: bien.charges,
      depotGarantie: locataire.depotGarantie,
      dateDebut: locataire.dateEntree,
      dureeAnnees: locataire.dureeBailAnnees,
      honoraires: extras.honoraires,
      indexIRL: extras.indexIRL,
      zoneTendue: extras.zoneTendue,
    };
  }

  function regenerate(tpl: LeaseTemplateId, extras: {
    bailleurNom: string;
    bailleurAdresse: string;
    bailleurEmail: string;
    indexIRL: string;
    zoneTendue: boolean;
    honoraires: number;
  }) {
    setArticles(generateLeaseArticles(tpl, buildInputs(extras)));
  }

  function onTemplateChange(t: LeaseTemplateId) {
    setTemplate(t);
    regenerate(t, { bailleurNom, bailleurAdresse, bailleurEmail, indexIRL, zoneTendue, honoraires });
  }

  function resetToTemplate() {
    if (!confirm("Réinitialiser tous les articles depuis le modèle ? Vos modifications seront perdues.")) return;
    regenerate(template, { bailleurNom, bailleurAdresse, bailleurEmail, indexIRL, zoneTendue, honoraires });
  }

  function updateArticle(numero: string, field: "titre" | "texte", value: string) {
    setArticles((s) => s.map((a) => (a.numero === numero ? { ...a, [field]: value } : a)));
  }

  function deleteArticle(numero: string) {
    if (!confirm(`Supprimer l'article ${numero} ?`)) return;
    setArticles((s) => s.filter((a) => a.numero !== numero));
  }

  function addArticle() {
    const nextNum = String((articles.length ? Math.max(...articles.map((a) => parseInt(a.numero) || 0)) : 0) + 1);
    setArticles((s) => [
      ...s,
      { numero: nextNum, titre: "Nouvel article", texte: "Saisissez le contenu de l'article…" },
    ]);
    setOpenArticle(nextNum);
  }

  function saveBail() {
    setStored({
      template,
      bailleurNom,
      bailleurAdresse,
      bailleurEmail,
      indexIRL,
      zoneTendue,
      honoraires,
      articles,
    });
    alert("Bail enregistré pour ce locataire.");
  }

  function exportPDF() {
    const tplLabel = LEASE_TEMPLATES.find((t) => t.id === template)?.label ?? "";
    downloadPdf({
      filename: `Bail-${locataire.nom.replace(/\s+/g, "_")}-${bien.id}.pdf`,
      footerLabel: "MoovIN · Contrat de bail",
      blocks: [
        { kind: "title", text: "CONTRAT DE BAIL D'HABITATION" },
        { kind: "subtitle", text: tplLabel.toUpperCase() },
        { kind: "spacer", height: 16 },
        ...articles.map((a) => ({
          kind: "article" as const,
          numero: a.numero,
          titre: a.titre,
          texte: a.texte,
        })),
        { kind: "spacer", height: 12 },
        { kind: "signatures", bailleur: bailleurNom, locataire: locataire.nom },
      ],
    });
  }

  function exportTXT() {
    const tplLabel = LEASE_TEMPLATES.find((t) => t.id === template)?.label ?? "";
    const txt = articlesToText(articles, `CONTRAT DE BAIL D'HABITATION\n${tplLabel.toUpperCase()}`);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
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
          <FileText className="h-4 w-4" /> Créer / éditer le bail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Bail — {locataire.nom}</DialogTitle>
          <DialogDescription>
            {stored
              ? "Bail personnalisé enregistré. Chaque article est éditable et l'ensemble s'exporte en PDF."
              : "Modèle pré-rempli depuis les infos du bien et du locataire. Chaque article peut être modifié, supprimé ou complété."}
          </DialogDescription>
        </DialogHeader>

        {/* En-tête bailleur + paramètres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border bg-elevated p-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5">
              <Label>Modèle de bail</Label>
              <InfoHint title="Modèle de bail">
                Changer de modèle régénère les articles selon le type choisi.
                Vos modifications manuelles seront alors écrasées.
              </InfoHint>
            </div>
            <select
              value={template}
              onChange={(e) => onTemplateChange(e.target.value as LeaseTemplateId)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LEASE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {LEASE_TEMPLATES.find((t) => t.id === template)?.description}
            </p>
          </div>
          <div>
            <Label>Nom du bailleur</Label>
            <Input className="mt-1.5" value={bailleurNom} onChange={(e) => setBailleurNom(e.target.value)} placeholder="Votre nom" />
          </div>
          <div>
            <Label>Adresse du bailleur</Label>
            <Input className="mt-1.5" value={bailleurAdresse} onChange={(e) => setBailleurAdresse(e.target.value)} placeholder="Adresse postale" />
          </div>
          <div>
            <Label>Email du bailleur</Label>
            <Input className="mt-1.5" type="email" value={bailleurEmail} onChange={(e) => setBailleurEmail(e.target.value)} placeholder="email@exemple.fr" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Label>Indice IRL de référence</Label>
              <InfoHint title="IRL">Indice de Référence des Loyers publié par l'INSEE. Ex : « T1 2025 — 145,47 ».</InfoHint>
            </div>
            <Input className="mt-1.5" value={indexIRL} onChange={(e) => setIndexIRL(e.target.value)} placeholder="T1 2026 — 146,xx" />
          </div>
          <div>
            <Label>Honoraires de mise en location (€ TTC)</Label>
            <Input className="mt-1.5" type="number" value={honoraires || ""} onChange={(e) => setHonoraires(Number(e.target.value))} step={10} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={zoneTendue}
                onChange={(e) => setZoneTendue(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Logement situé en zone tendue
            </label>
            <InfoHint title="Zone tendue">
              Encadrement des loyers à la relocation et au renouvellement. Concerne Paris, Lyon, Bordeaux, Lille…
            </InfoHint>
          </div>
        </div>

        {/* Articles éditables */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-semibold">Articles du bail ({articles.length})</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={resetToTemplate}>
                <RotateCcw className="h-4 w-4" /> Régénérer
              </Button>
              <Button size="sm" variant="outline" onClick={addArticle}>
                <Plus className="h-4 w-4" /> Ajouter un article
              </Button>
            </div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto divide-y">
            {articles.map((a) => {
              const isOpen = openArticle === a.numero;
              return (
                <div key={a.numero} className="">
                  <button
                    type="button"
                    onClick={() => setOpenArticle(isOpen ? null : a.numero)}
                    className="flex w-full items-center gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="text-xs font-mono text-muted-foreground">Art. {a.numero}</span>
                    <span className="text-sm font-medium truncate">{a.titre}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArticle(a.numero);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          deleteArticle(a.numero);
                        }
                      }}
                      className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Supprimer l'article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-3 pt-0 space-y-2 bg-muted/30">
                      <div>
                        <Label>Titre</Label>
                        <Input
                          className="mt-1"
                          value={a.titre}
                          onChange={(e) => updateArticle(a.numero, "titre", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Texte de l'article</Label>
                        <Textarea
                          className="mt-1 font-mono text-xs min-h-[140px]"
                          value={a.texte}
                          onChange={(e) => updateArticle(a.numero, "texte", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {articles.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Aucun article. Cliquez sur « Ajouter un article » ou « Régénérer » pour repartir du modèle.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <p className="text-xs text-muted-foreground">
            {stored ? "Bail personnalisé enregistré pour ce locataire." : "Bail non encore enregistré."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportTXT}>
              <Download className="h-4 w-4" /> .TXT
            </Button>
            <Button variant="outline" onClick={saveBail}>
              Enregistrer
            </Button>
            <Button onClick={exportPDF}>
              <Download className="h-4 w-4" /> Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
