import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialGauge, GroupedBarChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { dpePatrimoine, alertesConformite } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar } from "lucide-react";

export default function ConformitePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Conformité"
        description="DPE, PNO, baux, diagnostics — alertes automatisées et calendrier visuel."
        badge="Module 10"
      />

      <Card>
        <CardHeader>
          <CardTitleInfo
            title="Score de conformité global"
            hint={
              <>
                <p><strong>Score global</strong> = moyenne pondérée des 5 sous-scores.</p>
                <p className="mt-1">Catégories : DPE, Assurance, Bail, Diagnostics, Fiscal. Chacune sur 100.</p>
                <p className="mt-1">&lt; 60 = critique, 60-80 = à surveiller, &gt; 80 = en règle.</p>
              </>
            }
          />
          <CardDescription>Score général + sous-scores par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <RadialGauge value={84} label="Score global" thresholds={[60, 80]} />
            <RadialGauge value={75} label="DPE" thresholds={[50, 80]} />
            <RadialGauge value={95} label="Assurance" thresholds={[80, 90]} />
            <RadialGauge value={100} label="Bail" thresholds={[80, 95]} />
            <RadialGauge value={80} label="Diagnostics" thresholds={[60, 85]} />
            <RadialGauge value={70} label="Fiscal" thresholds={[60, 85]} />
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitleInfo
              title="Répartition DPE du patrimoine"
              hint={
                <>
                  <p>Nombre de biens par classe énergétique (A → G).</p>
                  <p className="mt-1"><strong>Calendrier légal d'interdiction :</strong></p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>2025 : classe G interdite à la location</li>
                    <li>2028 : classe F interdite</li>
                    <li>2034 : classe E interdite</li>
                  </ul>
                </>
              }
            />
            <CardDescription>Seuil légal : G interdit 2025, F 2028</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={dpePatrimoine}
              xKey="classe"
              series={[{ dataKey: "nb", name: "Biens" }]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Échéances à venir"
              hint="Timeline chronologique des échéances réglementaires. Rouge = retard, orange = &lt; 7j, bleu = à venir."
            />
            <CardDescription>Timeline chronologique</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {alertesConformite.map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-lg border bg-elevated p-3">
                  {a.type === "destructive" ? (
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                  ) : (
                    <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{a.titre}</p>
                    <Badge variant="secondary" className="mt-1">
                      {new Date(a.date).toLocaleDateString("fr-FR")}
                    </Badge>
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
