import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart, LineAreaChart, DonutChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";

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
            <CardTitleInfo
              title="Comparateur de régimes"
              hint={
                <>
                  <p><strong>3 régimes simulés :</strong></p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li><strong>Micro-foncier</strong> : abattement 30 %, simple. Plafond 15 000 €/an.</li>
                    <li><strong>Réel</strong> : déduction des charges réelles + amortissements. Optimal au-delà de 30 % de charges.</li>
                    <li><strong>LMNP</strong> : location meublée, amortissements élevés.</li>
                  </ul>
                  <p className="mt-1">Le plus avantageux est mis en évidence.</p>
                </>
              }
            />
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
            <CardTitleInfo
              title="Charges déductibles"
              hint={
                <>
                  <p>Au régime réel, ces postes viennent en déduction des loyers imposables :</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>Intérêts d'emprunt (mais pas le capital)</li>
                    <li>Taxe foncière</li>
                    <li>Assurance PNO</li>
                    <li>Travaux d'entretien (pas d'agrandissement)</li>
                    <li>Frais de gestion</li>
                  </ul>
                </>
              }
            />
            <CardDescription>Régime réel</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={chargesDeductibles} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title="Projection impôt sur 10 ans"
            hint="Estimation prospective : loyers +2 %/an, charges stables. Permet d'anticiper la trajectoire fiscale et de planifier les arbitrages (changement de régime, travaux déductibles)."
          />
          <CardDescription>Hypothèse inflation loyers 2 % / an</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={projection10ans} dataKey="impot" xKey="annee" />
        </CardContent>
      </Card>
    </div>
  );
}
