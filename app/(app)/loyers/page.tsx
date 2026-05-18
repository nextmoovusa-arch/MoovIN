import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineAreaChart,
  DonutChart,
  HorizontalBarChart,
  GroupedBarChart,
} from "@/components/charts/chart-kit";
import {
  loyersPrevuVsEncaisse,
  repartitionStatutsPaiement,
  cashFlowMensuel,
} from "@/lib/mock-data";

const tauxRecouvrement = cashFlowMensuel.map((m) => ({
  mois: m.mois,
  taux: 88 + Math.random() * 12,
}));

const topRisque = [
  { nom: "M. Dupond", score: 78 },
  { nom: "Mme Robert", score: 54 },
  { nom: "M. Lemaire", score: 42 },
  { nom: "Mme Petit", score: 28 },
  { nom: "M. Bernard", score: 12 },
];

export default function LoyersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi des loyers & impayés"
        description="Détection instantanée des anomalies et tendances de recouvrement."
        badge="Module 4"
      />

      <Card>
        <CardHeader>
          <CardTitle>Taux de recouvrement (24 mois)</CardTitle>
          <CardDescription>Cible 95% — alerte en dessous</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={tauxRecouvrement} dataKey="taux" xKey="mois" height={280} />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statuts de paiement</CardTitle>
            <CardDescription>Mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionStatutsPaiement} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 locataires à risque</CardTitle>
            <CardDescription>Score = retards × jours × montant</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={topRisque} xKey="score" yKey="nom" color="hsl(var(--destructive))" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Loyers prévus vs encaissés</CardTitle>
          <CardDescription>12 derniers mois — écart = montant impayé</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupedBarChart
            data={loyersPrevuVsEncaisse}
            xKey="mois"
            series={[
              { dataKey: "prevu", name: "Prévu", color: "hsl(var(--muted-foreground))" },
              { dataKey: "encaisse", name: "Encaissé" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
