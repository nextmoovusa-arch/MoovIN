"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, NumberInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoHint } from "@/components/ui/info-hint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBankConnection,
  useBankTransactions,
  useLocataires,
  rapprocherLoyers,
  BankTransaction,
} from "@/lib/store";
import { formatEUR } from "@/lib/utils";
import {
  Landmark,
  Link2,
  Unlink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

const BANQUES = ["Boursorama", "BNP Paribas", "Crédit Agricole", "Société Générale", "Crédit Mutuel", "Caisse d'Épargne", "LCL", "La Banque Postale", "Revolut", "Qonto", "Autre"];

export default function BanquePage() {
  const [connection, setConnection] = useBankConnection();
  const [transactions, setTransactions] = useBankTransactions();
  const [locataires] = useLocataires();

  const resultats = rapprocherLoyers(locataires, transactions);
  const nbRecus = resultats.filter((r) => r.statut === "recu").length;

  function removeTx(id: string) {
    setTransactions((s) => s.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapprochement bancaire"
        description="Connectez votre compte pour vérifier automatiquement que chaque loyer a bien été reçu (bon émetteur, bon montant)."
        badge="Suivi des encaissements"
      />

      {/* Connexion banque */}
      {!connection.connected ? (
        <ConnectCard onConnect={(banque, iban) => setConnection({ connected: true, banque, iban, dateConnexion: new Date().toISOString() })} />
      ) : (
        <Card>
          <CardContent className="p-5 flex flex-wrap items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Landmark className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold inline-flex items-center gap-2">
                {connection.banque} <Badge variant="success">Connecté</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                {connection.iban ? maskIban(connection.iban) : "Compte courant"} · depuis le{" "}
                {connection.dateConnexion ? new Date(connection.dateConnexion).toLocaleDateString("fr-FR") : "—"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Déconnecter le compte bancaire ?")) setConnection({ connected: false });
              }}
            >
              <Unlink className="h-4 w-4" /> Déconnecter
            </Button>
          </CardContent>
        </Card>
      )}

      {connection.connected && (
        <>
          {/* Synthèse rapprochement */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitleWithInfo />
                <Badge variant={nbRecus === resultats.length && resultats.length > 0 ? "success" : "warning"}>
                  {nbRecus}/{resultats.length} reçus
                </Badge>
              </div>
              <CardDescription>Comparaison automatique loyers attendus ↔ virements reçus</CardDescription>
            </CardHeader>
            <CardContent>
              {resultats.length === 0 ? (
                <EmptyState compact title="Aucun bail actif" message="Ajoutez des locataires pour suivre leurs loyers." />
              ) : (
                <ul className="divide-y">
                  {resultats.map((r) => (
                    <li key={r.locataire.id} className="flex items-center gap-3 py-3">
                      {r.statut === "recu" ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      ) : r.statut === "montant-incorrect" ? (
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.locataire.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          Attendu : {formatEUR(r.attendu)}
                          {r.transaction && ` · Reçu : ${formatEUR(r.transaction.montant)} (${r.transaction.libelle})`}
                        </p>
                      </div>
                      {r.statut === "recu" && <Badge variant="success">Reçu</Badge>}
                      {r.statut === "montant-incorrect" && <Badge variant="warning">Montant incorrect</Badge>}
                      {r.statut === "manquant" && <Badge variant="destructive">Non reçu</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Virements reçus */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Virements reçus</CardTitle>
                <AddTransactionDialog onAdd={(t) => setTransactions((s) => [t, ...s])} />
              </div>
              <CardDescription>
                Flux importé depuis votre banque. Le rapprochement se base sur l'émetteur (libellé) et le montant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  compact
                  title="Aucun virement"
                  message="Ajoutez les virements reçus (émetteur + montant) pour lancer le rapprochement automatique."
                />
              ) : (
                <ul className="divide-y">
                  {transactions.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.libelle}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className="text-sm font-semibold text-success">+{formatEUR(t.montant)}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeTx(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function CardTitleWithInfo() {
  return (
    <div className="flex items-center gap-2">
      <CardTitle>Suivi des loyers reçus</CardTitle>
      <InfoHint title="Comment fonctionne le rapprochement ?">
        <p>Pour chaque locataire, on cherche un virement dont :</p>
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          <li>le <strong>libellé contient le nom du locataire</strong> (l'émetteur)</li>
          <li>le <strong>montant correspond au loyer</strong> (± 1 €)</li>
        </ul>
        <p className="mt-1">Si l'émetteur correspond mais pas le montant → « montant incorrect ». Si rien → « non reçu ».</p>
      </InfoHint>
    </div>
  );
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s+/g, "");
  if (clean.length < 8) return iban;
  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}

function ConnectCard({ onConnect }: { onConnect: (banque: string, iban: string) => void }) {
  const [banque, setBanque] = React.useState(BANQUES[0]);
  const [iban, setIban] = React.useState("");
  const [step, setStep] = React.useState<"idle" | "connecting">("idle");

  function connect() {
    setStep("connecting");
    setTimeout(() => onConnect(banque, iban), 1200);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Landmark className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Connecter mon compte bancaire</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La connexion s'effectue via un agrégateur agréé (DSP2). MoovIN n'accède qu'aux opérations
              en lecture seule pour détecter vos loyers — jamais à vos identifiants.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Banque</Label>
                <select value={banque} onChange={(e) => setBanque(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {BANQUES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <Label>IBAN (facultatif)</Label>
                <Input className="mt-1.5" placeholder="FR76 ••••" value={iban} onChange={(e) => setIban(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={connect} disabled={step === "connecting"}>
                <Link2 className="h-4 w-4" />
                {step === "connecting" ? "Connexion sécurisée…" : "Connecter ma banque"}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Lecture seule · chiffré
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTransactionDialog({ onAdd }: { onAdd: (t: BankTransaction) => void }) {
  const [open, setOpen] = React.useState(false);
  const [libelle, setLibelle] = React.useState("");
  const [montant, setMontant] = React.useState<number | undefined>(undefined);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));

  function submit() {
    if (!libelle.trim() || !montant) return;
    onAdd({ id: Math.random().toString(36).slice(2), libelle, montant, date });
    setLibelle("");
    setMontant(undefined);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" /> Ajouter un virement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un virement reçu</DialogTitle>
          <DialogDescription>
            Indiquez l'émetteur (tel qu'il apparaît sur votre relevé) et le montant. Pour être rapproché,
            le libellé doit contenir le nom du locataire.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Libellé / émetteur</Label>
            <Input className="mt-1.5" placeholder="Ex : VIR Marie Lefèvre" value={libelle} onChange={(e) => setLibelle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Montant (€)</Label>
              <NumberInput className="mt-1.5" placeholder="Ex : 850" value={montant} onValueChange={setMontant} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!libelle.trim() || !montant}>Ajouter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
