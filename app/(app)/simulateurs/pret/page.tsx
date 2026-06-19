"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DonutChart,
  StackedAreaChart,
  SimpleLineChart,
} from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { InfoHint } from "@/components/ui/info-hint";
import { mensualitePret, tableauAmortissement } from "@/lib/calculs";
import { formatEUR } from "@/lib/utils";

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
  step?: number;
}) {
  const [text, setText] = React.useState(value === 0 ? "" : String(value));
  React.useEffect(() => {
    const current = text === "" ? 0 : Number(text.replace(",", "."));
    if (value !== current) setText(value === 0 ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "" || /^-?\d*([.,]\d*)?$/.test(raw)) {
      setText(raw);
      onChange(raw === "" || raw === "-" || raw === "." || raw === "," ? 0 : Number(raw.replace(",", ".")));
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handle}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <span className="px-3 py-2 text-sm text-muted-foreground border-l">{suffix}</span>
      </div>
    </label>
  );
}

export default function PretPage() {
  const [capital, setCapital] = React.useState(180000);
  const [taux, setTaux] = React.useState(3.5);
  const [duree, setDuree] = React.useState(20);
  const [assurance, setAssurance] = React.useState(40);

  const mens = mensualitePret(capital, taux, duree);
  const tableau = React.useMemo(() => tableauAmortissement(capital, taux, duree), [capital, taux, duree]);
  const interetsTotal = tableau.reduce((s, m) => s + m.partInterets, 0);
  const assuranceTotal = assurance * 12 * duree;
  const coutTotal = capital + interetsTotal + assuranceTotal;

  const cumul = tableau
    .filter((_, i) => i % 6 === 0)
    .map((m) => ({
      mois: `M${m.mois}`,
      capital: Math.round(capital - m.capitalRestantDu),
      interets: Math.round(tableau.slice(0, m.mois).reduce((s, x) => s + x.partInterets, 0)),
    }));

  const crd = tableau
    .filter((_, i) => i % 6 === 0)
    .map((m) => ({ mois: `M${m.mois}`, crd: Math.round(m.capitalRestantDu) }));

  const decomp = [
    { name: "Capital", value: Math.round(capital) },
    { name: "Intérêts", value: Math.round(interetsTotal) },
    { name: "Assurance", value: Math.round(assuranceTotal) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulateur de prêt immobilier"
        description="Mensualité, capital restant dû, coût du crédit et tableau d'amortissement."
        badge="Module 8"
      />

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Montant" value={capital} onChange={setCapital} suffix="€" step={1000} />
            <Field label="Taux annuel" value={taux} onChange={setTaux} suffix="%" step={0.1} />
            <Field label="Durée" value={duree} onChange={setDuree} suffix="ans" step={1} />
            <Field label="Assurance / mois" value={assurance} onChange={setAssurance} suffix="€" step={5} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-muted-foreground">Mensualité (hors assurance)</p>
                <InfoHint title="Mensualité">
                  <p><strong>Formule :</strong> M = C × i / (1 − (1+i)^−n)</p>
                  <p className="mt-1">C = capital, i = taux mensuel, n = nb mois.</p>
                </InfoHint>
              </div>
              <p className="text-xl font-bold text-primary">{formatEUR(mens)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-muted-foreground">Mensualité totale</p>
                <InfoHint title="Mensualité totale">Mensualité + prime d'assurance emprunteur.</InfoHint>
              </div>
              <p className="text-xl font-bold">{formatEUR(mens + assurance)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-muted-foreground">Total intérêts</p>
                <InfoHint title="Total intérêts">Somme de toutes les parts « intérêts » sur la durée totale.</InfoHint>
              </div>
              <p className="text-xl font-bold text-warning">{formatEUR(interetsTotal)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-muted-foreground">Coût total crédit</p>
                <InfoHint title="Coût total">Capital + intérêts + assurance sur toute la durée. À comparer à un achat cash.</InfoHint>
              </div>
              <p className="text-xl font-bold text-destructive">{formatEUR(coutTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Décomposition coût total"
              hint={
                <>
                  <p><strong>Type :</strong> donut.</p>
                  <p className="mt-1">Capital (ce que vous remboursez), intérêts (rémunération banque), assurance (couverture décès/invalidité).</p>
                </>
              }
            />
          </CardHeader>
          <CardContent>
            <DonutChart data={decomp} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo
              title="Pyramide capital / intérêts"
              hint={
                <>
                  <p><strong>Type :</strong> aire empilée cumulée.</p>
                  <p className="mt-1">Au début, vous remboursez surtout des intérêts. Vers la fin, surtout du capital. C'est mécanique : intérêts = taux × capital restant dû.</p>
                </>
              }
            />
            <CardDescription>Aire empilée cumulée</CardDescription>
          </CardHeader>
          <CardContent>
            <StackedAreaChart
              data={cumul}
              xKey="mois"
              series={[
                { dataKey: "capital", name: "Capital remboursé" },
                { dataKey: "interets", name: "Intérêts payés" },
              ]}
              height={280}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title="Capital restant dû dans le temps"
            hint="Courbe de ce que vous devez encore à la banque, mois après mois. Utile pour calculer une revente ou un remboursement anticipé."
          />
          <CardDescription>Décroissance progressive jusqu'à zéro</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={crd} xKey="mois" series={[{ dataKey: "crd", name: "CRD (€)" }]} height={280} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title="Tableau d'amortissement"
            hint={
              <>
                <p>Détail mois par mois :</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li><strong>Part intérêts</strong> = CRD × taux mensuel</li>
                  <li><strong>Part capital</strong> = mensualité − intérêts</li>
                  <li><strong>CRD</strong> = capital restant à rembourser</li>
                </ul>
              </>
            }
          />
          <CardDescription>24 premiers mois (scrollable)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Mois</th>
                <th className="py-2 pr-3 font-medium">Mensualité</th>
                <th className="py-2 pr-3 font-medium">Part intérêts</th>
                <th className="py-2 pr-3 font-medium">Part capital</th>
                <th className="py-2 pr-3 font-medium">CRD</th>
                <th className="py-2 pr-3 font-medium">Progression</th>
              </tr>
            </thead>
            <tbody>
              {tableau.slice(0, 24).map((m) => {
                const progress = ((capital - m.capitalRestantDu) / capital) * 100;
                return (
                  <tr key={m.mois} className="border-b">
                    <td className="py-2 pr-3">{m.mois}</td>
                    <td className="py-2 pr-3">{formatEUR(m.mensualite)}</td>
                    <td className="py-2 pr-3 text-warning">{formatEUR(m.partInterets)}</td>
                    <td className="py-2 pr-3 text-success">{formatEUR(m.partCapital)}</td>
                    <td className="py-2 pr-3">{formatEUR(m.capitalRestantDu)}</td>
                    <td className="py-2 pr-3 w-40">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
