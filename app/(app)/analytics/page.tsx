import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineAreaChart,
  DonutChart,
  GroupedBarChart,
  RadarMini,
  PaymentHeatmap,
  StackedAreaChart,
} from "@/components/charts/chart-kit";
import { cashFlowMensuel, repartitionPatrimoine, repartitionCharges, heatmapPaiements } from "@/lib/mock-data";

const cumulCash = cashFlowMensuel.map((m, i) => ({
  ...m,
  cumul: cashFlowMensuel.slice(0, i + 1).reduce((s, x) => s + x.cashFlow, 0),
}));

const radar = [
  { axis: "Rendement", value: 75 },
  { axis: "Occupation", value: 92 },
  { axis: "Recouvrement", value: 96 },
  { axis: "Conformité", value: 84 },
  { axis: "Diversification", value: 65 },
];

const ventilationMensuel = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    mois: d.toLocaleDateString("fr-FR", { month: "short" }),
    revenus: 5350,
    charges: -1850,
    pret: -2400,
  };
});

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Centre transverse de visualisation — agrégation, drill-down, exports."
        badge="Module 13"
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Patrimoine</CardTitle>
            <CardDescription>Répartition par bien</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionPatrimoine.map((p) => ({ name: p.name, value: p.value }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
            <CardDescription>Décomposition annuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionCharges} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs santé</CardTitle>
            <CardDescription>Radar synthétique</CardDescription>
          </CardHeader>
          <CardContent>
            <RadarMini data={radar} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Cash-flow cumulé</CardTitle>
          <CardDescription>Évolution depuis 24 mois</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={cumulCash} dataKey="cumul" xKey="mois" />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ventilation mensuelle</CardTitle>
            <CardDescription>Revenus, charges, remboursement prêt</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={ventilationMensuel}
              xKey="mois"
              series={[
                { dataKey: "revenus", name: "Revenus", color: "hsl(var(--success))" },
                { dataKey: "charges", name: "Charges", color: "hsl(var(--warning))" },
                { dataKey: "pret", name: "Prêt", color: "hsl(var(--destructive))" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heatmap paiements</CardTitle>
            <CardDescription>Vue agrégée annuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentHeatmap rows={heatmapPaiements} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
