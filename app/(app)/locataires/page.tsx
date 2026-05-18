import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HorizontalBarChart, DonutChart } from "@/components/charts/chart-kit";
import { locataires, biens } from "@/lib/mock-data";
import { User, Mail, Phone } from "lucide-react";

const pyramide = [
  { tranche: "0-6 mois", nb: 1 },
  { tranche: "6-12 mois", nb: 1 },
  { tranche: "1-2 ans", nb: 1 },
  { tranche: "2-3 ans", nb: 1 },
  { tranche: "3 ans+", nb: 0 },
];

const motifsDepart = [
  { name: "Fin naturelle", value: 12 },
  { name: "Rupture anticipée", value: 4 },
  { name: "Mutation", value: 2 },
  { name: "Expulsion", value: 1 },
];

export default function LocatairesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Locataires & Baux"
        description="Suivi des locataires actifs, historiques, durées d'occupation et motifs de départ."
        badge="Module 3"
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pyramide des durées d'occupation</CardTitle>
            <CardDescription>Locataires classés par tranche de durée</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={pyramide} xKey="nb" yKey="tranche" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motifs de départ (historique)</CardTitle>
            <CardDescription>Tous biens confondus, depuis le début</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={motifsDepart} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Locataires actifs ({locataires.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {locataires.map((l) => {
              const bien = biens.find((b) => b.id === l.bienId);
              return (
                <li key={l.id} className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{l.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {bien?.adresse}, {bien?.ville}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {l.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {l.telephone}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{l.dureeOccupationMois} mois</p>
                    <Badge variant={l.scoreFiabilite >= 90 ? "success" : "warning"}>
                      Score {l.scoreFiabilite}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
