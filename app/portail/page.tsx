"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Wrench,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input, Textarea, Label } from "@/components/ui/input";
import { InfoHint } from "@/components/ui/info-hint";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { useBiens, useLocataires } from "@/lib/store";
import { useLocalStorage } from "@/lib/storage";
import { formatEUR } from "@/lib/utils";
import { downloadPdf, downloadQuittancePDF } from "@/lib/pdf";
import { generateLeaseArticles } from "@/lib/lease-template";

type Signalement = {
  id: string;
  titre: string;
  description: string;
  statut: "En attente" | "Acceptée" | "En cours" | "Réparée";
  date: string;
  photo?: string;
};

type Message = { id: string; from: "locataire" | "bailleur"; texte: string; date: string };

type Paiement = { id: string; mois: string; montant: number; date: string };

export default function PortailLocatairePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement…</div>}>
      <PortailContent />
    </Suspense>
  );
}

function PortailContent() {
  const params = useSearchParams();
  const locataireId = params.get("l");
  const [biens] = useBiens();
  const [locataires] = useLocataires();

  // Locataire courant : celui passé en URL, sinon le premier
  const locataire =
    locataires.find((l) => l.id === locataireId) ?? locataires[0] ?? null;
  const bien = locataire ? biens.find((b) => b.id === locataire.bienId) : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header mobile-first */}
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo markClassName="h-7 w-7" wordClassName="text-base" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground border-l pl-2">
            Portail locataire
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Espace propriétaire
            </Link>
          </Button>
        </div>
      </header>

      {!locataire || !bien ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucun locataire actif n'est associé à ce portail. Demandez à votre propriétaire de
            vous créer un accès dans l'application.
          </p>
        </Card>
      ) : (
        <>
          {/* Identité */}
          <Card className="mb-6 bg-gradient-to-br from-primary/10 to-chart-4/10 border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Bienvenue
                </p>
                <h1 className="text-xl font-bold">{locataire.nom}</h1>
                <p className="text-sm text-muted-foreground truncate">
                  {bien.adresse}, {bien.ville}
                </p>
              </div>
              <Badge variant="success" className="hidden md:inline-flex">
                Bail actif
              </Badge>
            </CardContent>
          </Card>

          <Tabs defaultValue="paiement" className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-auto">
              <TabsTrigger value="paiement" className="flex-col gap-1 py-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-[11px]">Payer</span>
              </TabsTrigger>
              <TabsTrigger value="bail" className="flex-col gap-1 py-2">
                <FileText className="h-4 w-4" />
                <span className="text-[11px]">Bail</span>
              </TabsTrigger>
              <TabsTrigger value="quittances" className="flex-col gap-1 py-2">
                <Download className="h-4 w-4" />
                <span className="text-[11px]">Quittances</span>
              </TabsTrigger>
              <TabsTrigger value="signalement" className="flex-col gap-1 py-2">
                <Wrench className="h-4 w-4" />
                <span className="text-[11px]">Signaler</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-col gap-1 py-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px]">Messages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paiement">
              <PaiementTab locataireId={locataire.id} loyerMensuel={locataire.loyerMensuel} />
            </TabsContent>
            <TabsContent value="bail">
              <BailTab locataire={locataire} bien={bien} />
            </TabsContent>
            <TabsContent value="quittances">
              <QuittancesTab locataire={locataire} bien={bien} />
            </TabsContent>
            <TabsContent value="signalement">
              <SignalementTab locataireId={locataire.id} />
            </TabsContent>
            <TabsContent value="messages">
              <MessagesTab locataireId={locataire.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

/* ----------------- Paiement en ligne ----------------- */

function PaiementTab({ locataireId, loyerMensuel }: { locataireId: string; loyerMensuel: number }) {
  const [paiements, setPaiements] = useLocalStorage<Paiement[]>(
    `moovin.paiements.${locataireId}`,
    [],
  );
  const [step, setStep] = React.useState<"idle" | "processing" | "done">("idle");

  const moisCourant = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const dejaPaye = paiements.some((p) => p.mois === moisCourant);

  function payer() {
    setStep("processing");
    setTimeout(() => {
      setPaiements((s) => [
        {
          id: Math.random().toString(36).slice(2),
          mois: moisCourant,
          montant: loyerMensuel,
          date: new Date().toISOString(),
        },
        ...s,
      ]);
      setStep("done");
      setTimeout(() => setStep("idle"), 3000);
    }, 1200);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Paiement du loyer</CardTitle>
            <CardDescription>Virement sécurisé, instantané</CardDescription>
          </div>
          <InfoHint title="Paiement en ligne">
            Démo : le paiement est simulé localement. En production, intégration Stripe/GoCardless avec
            mandat SEPA récurrent et accusé de réception automatique au propriétaire.
          </InfoHint>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Loyer à payer pour</p>
          <p className="mt-1 text-lg font-medium capitalize">{moisCourant}</p>
          <p className="mt-3 text-4xl font-bold text-primary">{formatEUR(loyerMensuel)}</p>
          {dejaPaye ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> Loyer payé ce mois-ci
            </div>
          ) : (
            <Button
              onClick={payer}
              disabled={step !== "idle"}
              size="lg"
              className="mt-4"
            >
              {step === "processing" ? "Traitement…" : step === "done" ? "Paiement validé !" : `Payer ${formatEUR(loyerMensuel)}`}
            </Button>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Historique des paiements</p>
          {paiements.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun paiement enregistré pour l'instant.</p>
          ) : (
            <ul className="space-y-2">
              {paiements.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border bg-elevated p-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{p.mois}</p>
                    <p className="text-xs text-muted-foreground">
                      Payé le {new Date(p.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant="success">{formatEUR(p.montant)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------- Bail ----------------- */

function BailTab({ locataire, bien }: { locataire: any; bien: any }) {
  function downloadBailPdf() {
    // Récupération du bail personnalisé enregistré par le bailleur s'il existe
    let storedRaw: string | null = null;
    try {
      storedRaw = localStorage.getItem(`moovin.bail.${locataire.id}`);
    } catch {}
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    const articles = stored?.articles
      ? stored.articles
      : generateLeaseArticles("vide-non-meuble", {
          bailleurNom: stored?.bailleurNom ?? "",
          bailleurAdresse: stored?.bailleurAdresse ?? "",
          bailleurEmail: stored?.bailleurEmail ?? "",
          locataireNom: locataire.nom,
          locataireEmail: locataire.email,
          locataireTelephone: locataire.telephone,
          bienAdresse: `${bien.adresse}, ${bien.ville}`,
          bienType: bien.type,
          bienSurface: bien.surface,
          bienNbPieces: bien.nbPieces,
          loyerMensuel: locataire.loyerMensuel,
          charges: bien.charges,
          depotGarantie: locataire.depotGarantie,
          dateDebut: locataire.dateEntree,
          dureeAnnees: locataire.dureeBailAnnees,
        });

    downloadPdf({
      filename: `Bail-${locataire.nom.replace(/\s+/g, "_")}.pdf`,
      footerLabel: "MoovIN · Contrat de bail",
      blocks: [
        { kind: "title", text: "CONTRAT DE BAIL D'HABITATION" },
        { kind: "subtitle", text: "Exemplaire locataire" },
        { kind: "spacer", height: 16 },
        ...articles.map((a: any) => ({
          kind: "article" as const,
          numero: a.numero,
          titre: a.titre,
          texte: a.texte,
        })),
        { kind: "signatures", bailleur: stored?.bailleurNom ?? "", locataire: locataire.nom },
      ],
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon bail</CardTitle>
        <CardDescription>Consultation et téléchargement PDF</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Adresse" value={`${bien.adresse}, ${bien.ville}`} />
          <Info label="Type" value={`${bien.type} · ${bien.surface} m²`} />
          <Info label="Date d'entrée" value={new Date(locataire.dateEntree).toLocaleDateString("fr-FR")} />
          <Info label="Durée" value={`${locataire.dureeBailAnnees} ans`} />
          <Info label="Loyer mensuel" value={formatEUR(locataire.loyerMensuel)} />
          <Info label="Dépôt de garantie" value={formatEUR(locataire.depotGarantie)} />
        </div>
        <Button onClick={downloadBailPdf}>
          <Download className="h-4 w-4" /> Télécharger le bail (PDF)
        </Button>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-elevated p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/* ----------------- Quittances ----------------- */

function QuittancesTab({ locataire, bien }: { locataire: any; bien: any }) {
  const last24 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      mois: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      iso: d.toISOString().slice(0, 7),
    };
  });

  function downloadQ(mois: string) {
    // On récupère le bailleur depuis le bail enregistré s'il existe
    let storedRaw: string | null = null;
    try {
      storedRaw = localStorage.getItem(`moovin.bail.${locataire.id}`);
    } catch {}
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    downloadQuittancePDF({
      mois,
      bailleurNom: stored?.bailleurNom ?? "",
      bailleurAdresse: stored?.bailleurAdresse ?? "",
      locataireNom: locataire.nom,
      bienAdresse: `${bien.adresse}, ${bien.ville}`,
      loyer: locataire.loyerMensuel,
      charges: bien.charges,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes quittances</CardTitle>
        <CardDescription>12 derniers mois — téléchargement immédiat</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {last24.map((q) => (
            <li key={q.iso} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="capitalize text-sm">{q.mois}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadQ(q.mois)}>
                <Download className="h-4 w-4" /> PDF
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ----------------- Signalements ----------------- */

function SignalementTab({ locataireId }: { locataireId: string }) {
  const [items, setItems] = useLocalStorage<Signalement[]>(
    `moovin.signalements.${locataireId}`,
    [],
  );
  const [titre, setTitre] = React.useState("");
  const [desc, setDesc] = React.useState("");

  function submit() {
    if (!titre.trim()) return;
    setItems((s) => [
      {
        id: Math.random().toString(36).slice(2),
        titre,
        description: desc,
        statut: "En attente",
        date: new Date().toISOString(),
      },
      ...s,
    ]);
    setTitre("");
    setDesc("");
  }

  const couleurStatut: Record<Signalement["statut"], "warning" | "default" | "success"> = {
    "En attente": "warning",
    Acceptée: "default",
    "En cours": "default",
    Réparée: "success",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Signaler une réparation</CardTitle>
          <CardDescription>Fuite, panne, électricité, ascenseur…</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Titre court</Label>
            <Input
              className="mt-1.5"
              placeholder="Fuite sous l'évier"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Précisez ce qui se passe, depuis quand, urgence…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4" /> Ajouter une photo
            </Button>
            <Button onClick={submit} disabled={!titre.trim()}>
              <Send className="h-4 w-4" /> Envoyer au propriétaire
            </Button>
          </div>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes signalements ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className="rounded-lg border bg-elevated p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{s.titre}</p>
                    <Badge variant={couleurStatut[s.statut]}>{s.statut}</Badge>
                  </div>
                  {s.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(s.date).toLocaleString("fr-FR")}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ----------------- Messagerie ----------------- */

function MessagesTab({ locataireId }: { locataireId: string }) {
  const [messages, setMessages] = useLocalStorage<Message[]>(
    `moovin.messages.${locataireId}`,
    [
      {
        id: "m0",
        from: "bailleur",
        texte: "Bonjour, n'hésitez pas à me contacter pour toute question.",
        date: new Date().toISOString(),
      },
    ],
  );
  const [draft, setDraft] = React.useState("");

  function send() {
    if (!draft.trim()) return;
    setMessages((s) => [
      ...s,
      {
        id: Math.random().toString(36).slice(2),
        from: "locataire",
        texte: draft,
        date: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle>Messagerie avec le propriétaire</CardTitle>
        <CardDescription>Pour les questions non urgentes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "locataire" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.from === "locataire"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              <p>{m.texte}</p>
              <p
                className={`mt-0.5 text-[10px] ${
                  m.from === "locataire" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {new Date(m.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="border-t p-3 flex gap-2">
        <Input
          placeholder="Tapez votre message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button onClick={send} disabled={!draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
