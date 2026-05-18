import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineAreaChart,
  DonutChart,
  HorizontalBarChart,
  GroupedBarChart,
} from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
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
          <CardTitleInfo
            title="Taux de recouvrement (24 mois)"
            hint={
              <>
                <p><strong>Formule :</strong> (loyers encaissés / loyers dus) × 100.</p>
                <p className="mt-1"><strong>Type :</strong> graphique en aire avec ligne de référence à 95%.</p>
                <p className="mt-1">Un taux durablement &lt; 95 % révèle un problème structurel (locataires fragiles, retards récurrents).</p>
              </>
            }
          />
          <CardDescription>Cible 95% — alerte en dessous</CardDescription>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={tauxRecouvrement} dataKey="taux" xKey="mois" height={280} />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Statuts de paiement"
              hint={
                <>
                  <p><strong>Type :</strong> donut avec total au centre.</p>
                  <p className="mt-1">Catégories : payé à temps / payé en retard / en attente / impayé &gt; 30j.</p>
                </>
              }
            />
            <CardDescription>Mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionStatutsPaiement} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo
              title="Top 5 locataires à risque"
              hint={
                <>
                  <p><strong>Score de risque</strong> = (nombre de retards × jours moyens × montant impayé) normalisé sur 100.</p>
                  <p className="mt-1">Clic ligne = fiche locataire + actions (relance email/SMS, mise en demeure, escalade).</p>
                </>
              }
            />
            <CardDescription>Score = retards × jours × montant</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={topRisque} xKey="score" yKey="nom" color="hsl(var(--destructive))" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitleInfo
            title="Loyers prévus vs encaissés"
            hint={
              <>
                <p><strong>Type :</strong> barres groupées (2 par mois).</p>
                <p className="mt-1">Différence entre barre prévue et barre encaissée = montant non perçu sur le mois.</p>
              </>
            }
          />
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
