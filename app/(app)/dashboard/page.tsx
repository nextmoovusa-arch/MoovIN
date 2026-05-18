import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  LineAreaChart,
  DonutChart,
  GroupedBarChart,
  RadialGauge,
  PaymentHeatmap,
} from "@/components/charts/chart-kit";
import { PageHeader } from "@/components/layout/page-header";
import {
  cashFlowMensuel,
  repartitionPatrimoine,
  repartitionCharges,
  loyersPrevuVsEncaisse,
  heatmapPaiements,
  alertesConformite,
  biens,
} from "@/lib/mock-data";
import { formatEUR } from "@/lib/utils";
import { AlertTriangle, Bell, Download } from "lucide-react";

export default function DashboardPage() {
  const valeurPatrimoine = biens.reduce((s, b) => s + b.prixAchat, 0);
  const loyersMois = biens.filter((b) => b.etat === "Occupé").reduce((s, b) => s + b.loyerMensuel, 0);
  const cashFlowDernier = cashFlowMensuel[cashFlowMensuel.length - 1].cashFlow;
  const rendementMoyen =
    biens.reduce((s, b) => s + b.rendementNet, 0) / biens.length;

  const sparkA = cashFlowMensuel.slice(-12).map((d) => d.cashFlow);
  const sparkB = loyersPrevuVsEncaisse.map((d) => d.encaisse);
  const sparkC = cashFlowMensuel.slice(-12).map((d) => d.cashFlow);
  const sparkD = Array.from({ length: 12 }, () => 3 + Math.random() * 1.5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue 360° de votre patrimoine immobilier — KPIs en temps réel, alertes de conformité et indicateurs visuels."
        badge="Module 1"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Exporter PDF
            </Button>
            <Button size="sm">
              <Bell className="h-4 w-4" /> Notifications
            </Button>
          </>
        }
      />

      {/* Zone A — 4 cartes KPI avec sparklines (Tables 7/8 du CDC) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Valeur patrimoine"
          value={formatEUR(valeurPatrimoine)}
          delta="+1,2 %"
          trend="up"
          sparkData={sparkA}
          color="primary"
        />
        <StatCard
          label="Loyers du mois"
          value={formatEUR(loyersMois)}
          delta="+0,8 %"
          trend="up"
          sparkData={sparkB}
          color="success"
        />
        <StatCard
          label="Cash-flow mensuel"
          value={formatEUR(cashFlowDernier)}
          delta={cashFlowDernier >= 0 ? "+3,4 %" : "-2,1 %"}
          trend={cashFlowDernier >= 0 ? "up" : "down"}
          sparkData={sparkC}
          color={cashFlowDernier >= 0 ? "success" : "destructive"}
        />
        <StatCard
          label="Rendement net moyen"
          value={`${rendementMoyen.toFixed(1).replace(".", ",")} %`}
          delta="+0,2 pt"
          trend="up"
          sparkData={sparkD}
          color="warning"
        />
      </section>

      {/* Zone B — Évolution cash-flow pleine largeur */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Évolution du cash-flow</CardTitle>
              <CardDescription>Cash-flow mensuel net sur 24 mois, ligne de référence à zéro</CardDescription>
            </div>
            <div className="hidden md:flex gap-1">
              <Button variant="ghost" size="sm">12m</Button>
              <Button variant="secondary" size="sm">24m</Button>
              <Button variant="ghost" size="sm">36m</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LineAreaChart data={cashFlowMensuel} dataKey="cashFlow" xKey="mois" showZeroLine height={320} />
        </CardContent>
      </Card>

      {/* Zone C — Camembert patrimoine + barres loyers vs encaissés */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Répartition du patrimoine</CardTitle>
            <CardDescription>Valeur de chaque bien dans le total</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionPatrimoine.map((p) => ({ name: p.name, value: p.value }))} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Loyers prévus vs encaissés</CardTitle>
            <CardDescription>Comparaison sur 12 derniers mois — écart = impayés ou décalages</CardDescription>
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
      </section>

      {/* Zone — Charges + jauges */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Décomposition des charges annuelles</CardTitle>
            <CardDescription>Taxe foncière, assurance, copropriété, intérêts prêt…</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={repartitionCharges} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jauges de performance</CardTitle>
            <CardDescription>Rendement, occupation et recouvrement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RadialGauge value={5.2} max={10} label="Rendement brut" suffix=" %" thresholds={[3, 5]} />
              <RadialGauge value={3.5} max={6} label="Rendement net" suffix=" %" thresholds={[2, 4]} />
              <RadialGauge value={92} label="Taux occupation" thresholds={[80, 90]} />
              <RadialGauge value={96} label="Recouvrement" thresholds={[90, 95]} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Zone D — Heatmap paiements + alertes conformité */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Carte de chaleur des paiements</CardTitle>
            <CardDescription>12 mois × biens — vert = payé, orange = retard, rouge = impayé</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentHeatmap rows={heatmapPaiements} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alertes de conformité</CardTitle>
              <Badge variant="destructive">{alertesConformite.length}</Badge>
            </div>
            <CardDescription>Action requise à court terme</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {alertesConformite.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border bg-elevated p-3 transition-colors hover:border-primary/40"
                >
                  <AlertTriangle
                    className={
                      a.type === "destructive"
                        ? "h-4 w-4 mt-0.5 text-destructive shrink-0"
                        : a.type === "warning"
                          ? "h-4 w-4 mt-0.5 text-warning shrink-0"
                          : "h-4 w-4 mt-0.5 text-primary shrink-0"
                    }
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{a.titre}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Échéance : {new Date(a.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
