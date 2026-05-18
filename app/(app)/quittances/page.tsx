import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart, LineAreaChart } from "@/components/charts/chart-kit";
import { CardTitleInfo } from "@/components/ui/card-title-info";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";

const statutsEnvoi = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    mois: d.toLocaleDateString("fr-FR", { month: "short" }),
    generees: 5,
    envoyees: 5,
    lues: Math.max(2, 5 - Math.floor(Math.random() * 2)),
    telechargees: Math.max(1, 5 - Math.floor(Math.random() * 3)),
  };
});

const cumulAnnuel = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    mois: d.toLocaleDateString("fr-FR", { month: "short" }),
    cumul: (i + 1) * 5350,
  };
});

export default function QuittancesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quittances"
        description="Génération automatique mensuelle, distribution multi-canal (email, espace locataire, PDF)."
        badge="Module 5"
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" /> Lot mensuel (ZIP)
            </Button>
            <Button>
              <Send className="h-4 w-4" /> Envoyer les quittances
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Statut d'envoi des quittances"
              hint={
                <>
                  <p><strong>Type :</strong> barres groupées par mois.</p>
                  <p className="mt-1">4 étapes : générée → envoyée → lue (ouverture email) → téléchargée par le locataire.</p>
                  <p className="mt-1">L'écart entre envoyé et lu = relances à prévoir.</p>
                </>
              }
            />
            <CardDescription>Générées, envoyées, lues, téléchargées</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={statutsEnvoi}
              xKey="mois"
              series={[
                { dataKey: "generees", name: "Générées" },
                { dataKey: "envoyees", name: "Envoyées" },
                { dataKey: "lues", name: "Lues" },
                { dataKey: "telechargees", name: "Téléchargées" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleInfo
              title="Cumul annuel des loyers quittancés"
              hint={
                <>
                  <p><strong>Type :</strong> aire cumulative.</p>
                  <p className="mt-1">Total des loyers quittancés depuis janvier. À reporter sur la déclaration de revenus fonciers.</p>
                </>
              }
            />
            <CardDescription>Pour déclaration fiscale</CardDescription>
          </CardHeader>
          <CardContent>
            <LineAreaChart data={cumulAnnuel} dataKey="cumul" xKey="mois" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
