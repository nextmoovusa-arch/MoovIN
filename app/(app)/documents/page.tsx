import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialGauge, GroupedBarChart } from "@/components/charts/chart-kit";
import { biens } from "@/lib/mock-data";
import { File, FileText, FileImage } from "lucide-react";

const activite = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    mois: d.toLocaleDateString("fr-FR", { month: "short" }),
    uploads: Math.floor(2 + Math.random() * 8),
    consultations: Math.floor(5 + Math.random() * 15),
  };
});

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stockage & gestion documentaire"
        description="Baux, diagnostics, quittances, factures — indexés, recherche full-text (OCR)."
        badge="Module 6"
      />

      <Card>
        <CardHeader>
          <CardTitle>Score de conformité documentaire par bien</CardTitle>
          <CardDescription>% de documents obligatoires présents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {biens.map((b) => (
              <div key={b.id} className="text-center">
                <RadialGauge
                  value={70 + Math.random() * 30}
                  label={`${b.type} ${b.ville}`}
                  thresholds={[60, 85]}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité documentaire mensuelle</CardTitle>
            <CardDescription>Uploads vs consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={activite}
              xKey="mois"
              series={[
                { dataKey: "uploads", name: "Uploads" },
                { dataKey: "consultations", name: "Consultations" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
            <CardDescription>Répartition simplifiée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: FileText, label: "Baux & états des lieux", n: 12 },
              { icon: File, label: "Diagnostics & DPE", n: 18 },
              { icon: FileImage, label: "Quittances", n: 156 },
              { icon: File, label: "Factures travaux", n: 34 },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-lg border bg-elevated p-3">
                <c.icon className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm font-medium">{c.label}</span>
                <span className="text-sm font-bold text-muted-foreground">{c.n}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
