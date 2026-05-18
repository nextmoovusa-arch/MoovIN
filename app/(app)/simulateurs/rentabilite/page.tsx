"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DonutChart,
  RadialGauge,
  GroupedBarChart,
  LineAreaChart,
  RadarMini,
} from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { InfoHint } from "@/components/ui/info-hint";
import {
  calculerRentabilite,
  noteInvestissement,
  verdictInvestissement,
  RentabiliteInputs,
} from "@/lib/calculs";
import { formatEUR, formatPct, cn } from "@/lib/utils";

const defaults: RentabiliteInputs = {
  prixAchat: 200000,
  fraisNotaire: 16000,
  travaux: 12000,
  loyerMensuel: 950,
  chargesMensuelles: 250,
  taxeFonciere: 1200,
  assurancePNO: 300,
  vacanceLocativePct: 5,
  apport: 48000,
  tauxPret: 3.5,
  dureePretAnnees: 20,
  tauxMarginalImpot: 30,
};

function NumField({
  label,
  value,
  onChange,
  step = 100,
  suffix = "€",
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
  hint?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {label}
        {hint && <InfoHint title={label}>{hint}</InfoHint>}
      </span>
      <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <span className="px-3 py-2 text-sm text-muted-foreground border-l">{suffix}</span>
      </div>
    </label>
  );
}

function OutputCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  emphasis?: "success" | "destructive" | "primary";
}) {
  const cls =
    emphasis === "success"
      ? "text-success"
      : emphasis === "destructive"
        ? "text-destructive"
        : emphasis === "primary"
          ? "text-primary"
          : "text-foreground";
  return (
    <div className="rounded-lg border p-3 bg-card">
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && <InfoHint title={label}>{hint}</InfoHint>}
      </div>
      <p className={cn("mt-1 text-lg font-bold", cls)}>{value}</p>
    </div>
  );
}

export default function RentabilitePage() {
  const [inp, setInp] = React.useState<RentabiliteInputs>(defaults);
  const set = <K extends keyof RentabiliteInputs>(k: K) => (v: number) =>
    setInp((s) => ({ ...s, [k]: v }));

  // Calculs
  const o = calculerRentabilite(inp);
  const note = noteInvestissement(o);
  const verdict = verdictInvestissement(note);

  // Projection cash-flow annuel sur 25 ans avec
  //   - indexation loyer 1,5 %/an
  //   - indexation charges, taxe et PNO 2 %/an
  //   - mensualité de prêt UNIQUEMENT pendant la durée du prêt
  //     → pic à la hausse à la fin du prêt (la mensualité disparaît)
  const indexLoyer = 0.015;
  const indexCharges = 0.02;
  const projection = Array.from({ length: 25 }, (_, i) => {
    const annee = i + 1;
    const loyersAn =
      inp.loyerMensuel * 12 * (1 - inp.vacanceLocativePct / 100) * Math.pow(1 + indexLoyer, i);
    const chargesAn =
      (inp.chargesMensuelles * 12 + inp.taxeFonciere + inp.assurancePNO) *
      Math.pow(1 + indexCharges, i);
    const pretAn = annee <= inp.dureePretAnnees ? o.mensualitePret * 12 : 0;
    return {
      annee: `An ${annee}`,
      cashFlow: Math.round(loyersAn - chargesAn - pretAn),
      pretActif: annee <= inp.dureePretAnnees,
    };
  });

  const charges = [
    { name: "Taxe foncière", value: inp.taxeFonciere },
    { name: "Assurance PNO", value: inp.assurancePNO },
    { name: "Charges mensuelles ×12", value: inp.chargesMensuelles * 12 },
    { name: "Intérêts prêt (an 1)", value: Math.round(o.capitalEmprunte * (inp.tauxPret / 100)) },
  ];

  const scenarios = [
    { scenario: "Pessimiste", rendement: o.rendementNet * 0.85, cashFlow: o.cashFlowMensuel - 150 },
    { scenario: "Nominal", rendement: o.rendementNet, cashFlow: o.cashFlowMensuel },
    { scenario: "Optimiste", rendement: o.rendementNet * 1.15, cashFlow: o.cashFlowMensuel + 150 },
  ];

  const radar = [
    { axis: "Rendement", value: Math.min(100, (o.rendementNet / 6) * 100) },
    { axis: "Cash-flow", value: o.cashFlowMensuel >= 0 ? 90 : 40 },
    { axis: "Localisation", value: 70 },
    { axis: "Évolution", value: 75 },
    { axis: "Sécurité", value: 80 },
  ];

  const projPatrimoine = Array.from({ length: 25 }, (_, i) => ({
    annee: `An ${i + 1}`,
    patrimoine: Math.round(inp.prixAchat * Math.pow(1.02, i)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulateur de rentabilité — Est-ce rentable ?"
        description="Calcul réel et prospectif d'un investissement immobilier : rendements, cash-flow, mensualité, TRI, verdict et note /100."
        badge="Modules 7 + 12"
        actions={
          <Button onClick={() => setInp(defaults)} variant="outline">
            Réinitialiser
          </Button>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* INPUTS */}
        <Card className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
          <CardHeader>
            <CardTitleInfo
              title="Paramètres"
              hint={
                <>
                  <p>Tous les champs sont éditables.</p>
                  <p className="mt-1">Les calculs se mettent à jour <strong>en temps réel</strong> à chaque modification.</p>
                </>
              }
            />
            <CardDescription>Modifiez les valeurs — calculs en temps réel</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <NumField
              label="Prix d'achat"
              value={inp.prixAchat}
              onChange={set("prixAchat")}
              step={1000}
              hint="Prix net vendeur, hors frais d'acquisition."
            />
            <NumField
              label="Frais de notaire"
              value={inp.fraisNotaire}
              onChange={set("fraisNotaire")}
              step={500}
              hint={
                <>
                  <p>Frais d'acquisition (notaire + droits d'enregistrement).</p>
                  <p className="mt-1">Règle de pouce : <strong>7 à 8 % du prix</strong> dans l'ancien, 2-3 % dans le neuf.</p>
                </>
              }
            />
            <NumField
              label="Travaux"
              value={inp.travaux}
              onChange={set("travaux")}
              step={500}
              hint="Travaux initiaux à réaliser avant mise en location."
            />

            {/* Investissement total — toujours visible */}
            <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Investissement total
                </p>
                <InfoHint title="Investissement total">
                  <p>
                    <strong>Prix d'achat + frais de notaire + travaux</strong>
                  </p>
                  <p className="mt-1 font-mono">
                    {formatEUR(inp.prixAchat)} + {formatEUR(inp.fraisNotaire)} + {formatEUR(inp.travaux)}{" "}
                    = {formatEUR(o.investissementTotal)}
                  </p>
                  <p className="mt-1">
                    C'est la base réelle pour calculer le rendement net (et non le seul prix d'achat).
                  </p>
                </InfoHint>
              </div>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatEUR(o.investissementTotal)}
              </p>
            </div>

            <NumField
              label="Loyer mensuel"
              value={inp.loyerMensuel}
              onChange={set("loyerMensuel")}
              step={10}
              hint="Loyer hors charges (charges récupérables hors champ)."
            />
            <NumField
              label="Charges mensuelles"
              value={inp.chargesMensuelles}
              onChange={set("chargesMensuelles")}
              step={10}
              hint="Charges récurrentes côté propriétaire (syndic, gestion, maintenance moyenne)."
            />
            <NumField
              label="Taxe foncière / an"
              value={inp.taxeFonciere}
              onChange={set("taxeFonciere")}
              step={50}
              hint="Taxe annuelle locale, communiquée sur l'avis d'imposition."
            />
            <NumField
              label="Assurance PNO / an"
              value={inp.assurancePNO}
              onChange={set("assurancePNO")}
              step={10}
              hint="Propriétaire Non Occupant — obligatoire en copropriété."
            />
            <NumField
              label="Vacance locative"
              value={inp.vacanceLocativePct}
              onChange={set("vacanceLocativePct")}
              step={1}
              suffix="%"
              hint="Part de l'année où le bien est vide entre deux locataires. Réaliste : 2-10 %."
            />
            <NumField
              label="Apport"
              value={inp.apport}
              onChange={set("apport")}
              step={1000}
              hint="Cash injecté. Le solde (investissement − apport) est financé par le prêt."
            />
            <NumField
              label="Taux du prêt"
              value={inp.tauxPret}
              onChange={set("tauxPret")}
              step={0.1}
              suffix="%"
              hint="Taux nominal annuel (TAEG hors assurance)."
            />
            <NumField
              label="Durée prêt"
              value={inp.dureePretAnnees}
              onChange={set("dureePretAnnees")}
              step={1}
              suffix="ans"
              hint="Durée d'amortissement. Plus c'est long, plus la mensualité baisse mais plus le coût total grimpe."
            />
            <NumField
              label="Taux marginal IR"
              value={inp.tauxMarginalImpot}
              onChange={set("tauxMarginalImpot")}
              step={1}
              suffix="%"
              hint="Tranche marginale d'imposition (11 / 30 / 41 / 45 %). Sert au rendement net après impôts."
            />
          </CardContent>
        </Card>

        {/* RESULTATS */}
        <div className="lg:col-span-2 space-y-4">
          {/* VERDICT XL */}
          <Card
            className={cn(
              "border-2",
              verdict.color === "success" && "border-success/40 bg-success/5",
              verdict.color === "warning" && "border-warning/40 bg-warning/5",
              verdict.color === "destructive" && "border-destructive/40 bg-destructive/5",
            )}
          >
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:col-span-1">
                  <RadialGauge value={note} label="Note /100" suffix="" thresholds={[50, 70]} />
                </div>
                <div className="md:col-span-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Verdict</p>
                    <InfoHint title="Note d'investissement /100">
                      <p>Pondération :</p>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        <li>Rendement (50 %)</li>
                        <li>Risque impayés / cash-flow (20 %)</li>
                        <li>Localisation / demande (15 %)</li>
                        <li>Évolutivité du loyer (15 %)</li>
                      </ul>
                      <p className="mt-1">
                        Seuils : ≥ 70 excellent · 50-70 correct · &lt; 50 risqué.
                      </p>
                    </InfoHint>
                  </div>
                  <h2
                    className={cn(
                      "mt-2 text-3xl md:text-4xl font-bold tracking-tight",
                      verdict.color === "success" && "text-success",
                      verdict.color === "warning" && "text-warning",
                      verdict.color === "destructive" && "text-destructive",
                    )}
                  >
                    {verdict.label}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Rendement net <strong className="text-foreground">{formatPct(o.rendementNet)}</strong> ·
                    Cash-flow <strong className="text-foreground">{formatEUR(o.cashFlowMensuel)}</strong>/mois ·
                    Mensualité <strong className="text-foreground">{formatEUR(o.mensualitePret)}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JAUGES + Chiffres clés */}
          <Card>
            <CardHeader>
              <CardTitleInfo
                title="Jauges de rentabilité"
                hint={
                  <>
                    <p>3 jauges radiales avec seuils colorés.</p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li><strong>Brut</strong> = loyer annuel / prix d'achat</li>
                      <li><strong>Net</strong> = (loyers − charges) / investissement total <em>(notaire + travaux inclus)</em></li>
                      <li><strong>Net après IR</strong> = net × (1 − taux marginal)</li>
                    </ul>
                  </>
                }
              />
              <CardDescription>Brut, net, net après impôts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <RadialGauge value={o.rendementBrut} max={10} label="Rendement brut" suffix=" %" thresholds={[3, 5]} />
                <RadialGauge value={o.rendementNet} max={8} label="Rendement net" suffix=" %" thresholds={[2, 4]} />
                <RadialGauge value={o.rendementNetApresImpots} max={6} label="Net après IR" suffix=" %" thresholds={[1, 3]} />
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                <OutputCard
                  label="Mensualité du prêt"
                  value={formatEUR(o.mensualitePret)}
                  emphasis="primary"
                  hint={
                    <>
                      <p><strong>Formule :</strong> M = C × i / (1 − (1+i)^−n).</p>
                      <p className="mt-1">C = capital emprunté, i = taux mensuel, n = nombre de mois.</p>
                      <p className="mt-1 font-mono">
                        C = {formatEUR(o.capitalEmprunte)}<br />
                        i = {(inp.tauxPret / 12).toFixed(3)} % /mois<br />
                        n = {inp.dureePretAnnees * 12} mois
                      </p>
                    </>
                  }
                />
                <OutputCard
                  label="Cash-flow / mois"
                  value={formatEUR(o.cashFlowMensuel)}
                  emphasis={o.cashFlowMensuel >= 0 ? "success" : "destructive"}
                  hint={
                    <>
                      <p><strong>Formule :</strong></p>
                      <p className="mt-1 font-mono text-[11px]">
                        loyer − charges − taxeFonc/12 − PNO/12 − mensualité
                      </p>
                      <p className="mt-1">Positif = bien autofinancé. Négatif = vous mettez la main à la poche tous les mois.</p>
                    </>
                  }
                />
                <OutputCard
                  label="Investissement total (incl. notaire)"
                  value={formatEUR(o.investissementTotal)}
                  emphasis="primary"
                  hint={
                    <p>
                      Prix d'achat + frais de notaire + travaux.{" "}
                      <strong>Inclut bien les frais</strong>, contrairement au simple prix d'achat.
                    </p>
                  }
                />
                <OutputCard
                  label="Capital emprunté"
                  value={formatEUR(o.capitalEmprunte)}
                  hint="Investissement total − apport. C'est ce que la banque vous prête."
                />
                <OutputCard
                  label="Effort d'épargne"
                  value={formatPct(o.effortEpargne)}
                  hint={
                    <>
                      <p><strong>Formule :</strong> apport / investissement total × 100.</p>
                      <p className="mt-1">Part du financement assurée par votre cash. Plus c'est bas, plus le levier bancaire est important.</p>
                    </>
                  }
                />
                <OutputCard
                  label="Loyers annuels (net vacance)"
                  value={formatEUR(o.loyersAnnuels)}
                  hint={`Loyer × 12 × (1 − vacance ${inp.vacanceLocativePct}%).`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Projection cash-flow */}
          <Card>
            <CardHeader>
              <CardTitleInfo
                title="Projection cash-flow 25 ans"
                hint={
                  <>
                    <p><strong>Calcul annuel :</strong></p>
                    <p className="mt-1 font-mono text-[11px]">loyers − charges − taxe − PNO − mensualité×12</p>
                    <p className="mt-2"><strong>Hypothèses :</strong></p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li>Loyer indexé +1,5 %/an</li>
                      <li>Charges/taxe/PNO indexés +2 %/an</li>
                      <li>Mensualité fixe pendant <strong>{inp.dureePretAnnees} ans</strong> puis <strong>0</strong></li>
                    </ul>
                    <p className="mt-2">
                      À l'<strong>An {inp.dureePretAnnees + 1}</strong>, le prêt est remboursé : la mensualité disparaît, le cash-flow saute de{" "}
                      <strong>{formatEUR(o.mensualitePret * 12)}/an</strong>.
                    </p>
                  </>
                }
              />
              <CardDescription>
                Loyers indexés, charges indexées, mensualité jusqu'à l'An {inp.dureePretAnnees} (pic à l'An{" "}
                {inp.dureePretAnnees + 1})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineAreaChart
                data={projection}
                dataKey="cashFlow"
                xKey="annee"
                height={260}
                showZeroLine
                referenceLine={{
                  xValue: `An ${inp.dureePretAnnees}`,
                  label: "Fin du prêt",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Décomposition des charges"
              hint={
                <>
                  <p><strong>Type :</strong> donut.</p>
                  <p className="mt-1">Postes : taxe foncière, PNO, charges courantes, intérêts prêt (année 1).</p>
                  <p className="mt-1">Identifier le poste le plus lourd pour cibler les arbitrages.</p>
                </>
              }
            />
          </CardHeader>
          <CardContent>
            <DonutChart data={charges} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Comparateur de scénarios"
              hint={
                <>
                  <p>3 scénarios automatiques :</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li><strong>Pessimiste</strong> : −15 % rendement, −150 € cash-flow</li>
                    <li><strong>Nominal</strong> : valeurs saisies</li>
                    <li><strong>Optimiste</strong> : +15 %, +150 €</li>
                  </ul>
                  <p className="mt-1">Vérifie la robustesse face à un loyer un peu plus bas ou un imprévu.</p>
                </>
              }
            />
            <CardDescription>Rendement net et cash-flow</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={scenarios}
              xKey="scenario"
              series={[
                { dataKey: "rendement", name: "Rendement net (%)" },
                { dataKey: "cashFlow", name: "Cash-flow / mois (€)" },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Radar des indicateurs"
              hint={
                <>
                  <p><strong>Type :</strong> radar 5 axes.</p>
                  <p className="mt-1">Compare l'investissement aux <strong>moyennes marché</strong> (référence 100).</p>
                  <p className="mt-1">Plus la surface bleue est grande, plus le bien est solide.</p>
                </>
              }
            />
            <CardDescription>Comparaison aux moyennes marché</CardDescription>
          </CardHeader>
          <CardContent>
            <RadarMini data={radar} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Projection patrimoine 25 ans"
              hint="Valeur du bien estimée avec inflation immobilière 2 % / an. Le patrimoine net = cette courbe − capital restant dû."
            />
            <CardDescription>Valeur estimée avec inflation 2 % / an</CardDescription>
          </CardHeader>
          <CardContent>
            <LineAreaChart data={projPatrimoine} dataKey="patrimoine" xKey="annee" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
