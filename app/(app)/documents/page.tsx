"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useDocuments,
  useBiens,
  useLocataires,
  DocumentStored,
  DOC_CATEGORIES,
  DocCategorie,
  newId,
  fileToDataURL,
} from "@/lib/store";
import { Folder, Upload, Trash2, Download, FileText, User, Building2, Search } from "lucide-react";

function formatTaille(o: number) {
  if (o < 1024) return `${o} o`;
  if (o < 1024 * 1024) return `${(o / 1024).toFixed(0)} Ko`;
  return `${(o / 1024 / 1024).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useDocuments();
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  const [filtreCategorie, setFiltreCategorie] = React.useState<string>("");
  const [filtrePersonne, setFiltrePersonne] = React.useState<string>("");
  const [recherche, setRecherche] = React.useState("");

  function add(d: DocumentStored) {
    setDocuments((s) => [d, ...s]);
  }
  function remove(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    setDocuments((s) => s.filter((d) => d.id !== id));
  }
  function download(d: DocumentStored) {
    const a = document.createElement("a");
    a.href = d.dataUrl;
    a.download = d.nom;
    a.click();
  }

  const filtres = documents.filter((d) => {
    if (filtreCategorie && d.categorie !== filtreCategorie) return false;
    if (filtrePersonne && d.locataireId !== filtrePersonne) return false;
    if (recherche && !d.nom.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  const nomLocataire = (id?: string | null) => locataires.find((l) => l.id === id)?.nom;
  const adresseBien = (id?: string | null) => {
    const b = biens.find((x) => x.id === id);
    return b ? `${b.adresse}, ${b.ville}` : undefined;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Déposez vos documents, classez-les par catégorie et retrouvez-les par bien ou par locataire."
        badge="Module 6"
        actions={<UploadDialog biens={biens} locataires={locataires} onCreate={add} />}
      />

      {/* Filtres */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher un document…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <select
            value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm md:w-56"
          >
            <option value="">Toutes les catégories</option>
            {DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filtrePersonne}
            onChange={(e) => setFiltrePersonne(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm md:w-56"
          >
            <option value="">Tous les locataires</option>
            {locataires.map((l) => (
              <option key={l.id} value={l.id}>{l.nom}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {filtres.length} document{filtres.length > 1 ? "s" : ""}
            {filtrePersonne && ` · ${nomLocataire(filtrePersonne)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="Aucun document"
              message="Déposez vos baux, diagnostics, quittances, justificatifs… et classez-les par catégorie."
              action={<UploadDialog biens={biens} locataires={locataires} onCreate={add} />}
            />
          ) : filtres.length === 0 ? (
            <EmptyState compact title="Aucun résultat" message="Aucun document ne correspond à vos filtres." />
          ) : (
            <ul className="divide-y">
              {filtres.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.nom}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <Badge variant="secondary">{d.categorie}</Badge>
                      {d.locataireId && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> {nomLocataire(d.locataireId)}
                        </span>
                      )}
                      {d.bienId && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" /> {adresseBien(d.bienId)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatTaille(d.taille)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => download(d)} aria-label="Télécharger">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(d.id)} className="text-muted-foreground hover:text-destructive" aria-label="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UploadDialog({
  biens,
  locataires,
  onCreate,
}: {
  biens: { id: string; adresse: string; ville: string }[];
  locataires: { id: string; nom: string; bienId: string | null }[];
  onCreate: (d: DocumentStored) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [categorie, setCategorie] = React.useState<DocCategorie>("Bail");
  const [bienId, setBienId] = React.useState<string>("");
  const [locataireId, setLocataireId] = React.useState<string>("");

  async function submit() {
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    onCreate({
      id: newId("D"),
      nom: file.name,
      categorie,
      dataUrl,
      mime: file.type,
      taille: file.size,
      dateAjout: new Date().toISOString(),
      bienId: bienId || null,
      locataireId: locataireId || null,
    });
    setFile(null);
    setBienId("");
    setLocataireId("");
    setCategorie("Bail");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4" /> Déposer un document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Déposer un document</DialogTitle>
          <DialogDescription>Choisissez un fichier, une catégorie et rattachez-le à un bien et/ou un locataire.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Fichier</Label>
            <label className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input py-8 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Cliquez pour choisir un fichier"}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <Label>Catégorie</Label>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value as DocCategorie)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Bien rattaché (facultatif)</Label>
            <select value={bienId} onChange={(e) => setBienId(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">—</option>
              {biens.map((b) => <option key={b.id} value={b.id}>{b.adresse}, {b.ville}</option>)}
            </select>
          </div>
          <div>
            <Label>Locataire rattaché (facultatif)</Label>
            <select value={locataireId} onChange={(e) => setLocataireId(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">—</option>
              {locataires.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!file}>Déposer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
