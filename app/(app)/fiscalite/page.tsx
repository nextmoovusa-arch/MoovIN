import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart, LineAreaChart, DonutChart } from "@/components/charts/chart-kit";

const comparateurRegimes = [
  { regime: "Micro-foncier", impot: 3600, netApresImpot: 8400 },
  { regime: "Réel", impot: 1900, netApresImpot: 10100 },
  { regime: "LMNP", impot: 1200, netApresImpot: 10800 },
];

const projection10ans = Array.from({ length: 10 }, (_, i) => ({
  annee: `An ${i + 1}`,
  impot: 1900 + i * 80,
}));

const chargesDeductibles = [
  { name: "Intérêts prêt", value: 4800 },
  { name: "Taxe foncière", value: 1200 },
  { name: "Assurance PNO", value: 300 },
  { name: "Travaux", value: 1500 },
  { name: "Gestion", value: 600 },
];

export default function FiscalitePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscalité"
        description="Calcul de l'imposition réelle selon le régime — Micro-foncier, Réel, LMNP."
        badge="Module 9"
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Comparateur de régimes</CardTitle>
            <CardDescription>Impôt et revenu net après impôt</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={comparateurRegimes}
              xKey="regime"
              series={[
                { dataKey: "impot", name: "Impôt estimé (€)", color: "hsl(var(--destructive))" },
                { dataKey: "netApresImpot", name: "Net après impôt (€)", color: "hsl(var(--success))" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charges déductibles</CardTitle>
            <CardDescription>Régime réel</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={chargesDeductibles} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Projection impôt sur 10 ans</CardTitle>
          <CardDescription>Hypothèse inflation loyers 2 % / an</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={projection10ans} dataKey="impot" xKey="annee" />
        </CardContent>
      </Card>
    </div>
  );
}
