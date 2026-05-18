import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { biens, dpePatrimoine } from "@/lib/mock-data";
import { formatEUR, formatPct } from "@/lib/utils";
import { DonutChart, Sparkline, GroupedBarChart } from "@/components/charts/chart-kit";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

const dpeColors: Record<string, string> = {
  A: "bg-emerald-500",
  B: "bg-green-500",
  C: "bg-lime-500",
  D: "bg-yellow-500",
  E: "bg-orange-500",
  F: "bg-red-500",
  G: "bg-rose-600",
};

export default function BiensPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes biens immobiliers"
        description="Vue d'ensemble du patrimoine avec mini-graphiques par ligne et indicateurs visuels."
        badge="Module 2"
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Ajouter un bien
          </Button>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Studio, T1, T2, T3+</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={Object.entries(
                biens.reduce<Record<string, number>>((acc, b) => {
                  acc[b.type] = (acc[b.type] ?? 0) + 1;
                  return acc;
                }, {}),
              ).map(([name, value]) => ({ name, value }))}
              height={220}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Classes DPE du patrimoine</CardTitle>
            <CardDescription>Seuils légaux : G interdit 2025, F 2028</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={dpePatrimoine}
              xKey="classe"
              series={[{ dataKey: "nb", name: "Nombre de biens" }]}
              height={220}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Liste des biens ({biens.length})</CardTitle>
          <CardDescription>Tableau interactif avec sparklines par ligne</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="py-2 pr-3 font-medium">Bien</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Surface</th>
                <th className="py-2 pr-3 font-medium">Loyer</th>
                <th className="py-2 pr-3 font-medium">Rendement</th>
                <th className="py-2 pr-3 font-medium">DPE</th>
                <th className="py-2 pr-3 font-medium">État</th>
                <th className="py-2 pr-3 font-medium hidden md:table-cell">Évolution loyer</th>
              </tr>
            </thead>
            <tbody>
              {biens.map((b) => {
                const trend = Array.from({ length: 12 }, () => b.loyerMensuel * (0.95 + Math.random() * 0.1));
                const rendBadge =
                  b.rendementNet < 2 ? "destructive" : b.rendementNet < 4 ? "warning" : "success";
                const etatBadge =
                  b.etat === "Occupé" ? "success" : b.etat === "Vacant" ? "destructive" : "warning";
                return (
                  <tr key={b.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <Link href="#" className="font-medium text-foreground hover:text-primary">
                            {b.adresse}
                          </Link>
                          <p className="text-xs text-muted-foreground">{b.ville}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{b.type}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{b.surface} m²</td>
                    <td className="py-3 pr-3 font-medium">{formatEUR(b.loyerMensuel)}</td>
                    <td className="py-3 pr-3">
                      <Badge variant={rendBadge as any}>{formatPct(b.rendementNet)}</Badge>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-bold ${dpeColors[b.dpe]}`}
                      >
                        {b.dpe}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant={etatBadge as any}>{b.etat}</Badge>
                    </td>
                    <td className="py-3 pr-3 hidden md:table-cell w-40">
                      <Sparkline data={trend} />
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
