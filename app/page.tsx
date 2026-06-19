import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/brand/logo";
import {
  ArrowRight,
  ChartPieIcon,
  Shield,
  Sparkles,
  Sun,
  Calculator,
  Users,
  Eye,
} from "lucide-react";

const features = [
  { icon: ChartPieIcon, title: "48+ visualisations", desc: "Camemberts, courbes, jauges, heatmaps — interactifs et exportables." },
  { icon: Sun, title: "Mode clair & sombre", desc: "Bascule instantanée, palette adaptée, anti-FOUC dès le chargement." },
  { icon: Calculator, title: "Simulateurs financiers", desc: "Rentabilité, prêt amortissable, fiscalité, TRI." },
  { icon: Sparkles, title: "Est-ce rentable ?", desc: "Verdict clair avec note /100, radar et projection 25 ans." },
  { icon: Users, title: "Espace locataire", desc: "Quittances, signalements, messagerie — réduit -80% des SMS." },
  { icon: Shield, title: "Conformité automatisée", desc: "DPE, PNO, bail — alertes proactives & calendrier." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur px-4 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/dashboard">
              Lancer l'app <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 md:py-24 lg:py-32">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-elevated px-3 py-1 text-xs font-medium text-muted-foreground animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Cahier des charges v2.0 — Édition enrichie
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in">
            Le cockpit financier des{" "}
            <span className="text-gradient">investisseurs immobiliers</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Pilotez votre patrimoine en temps réel : dashboard 360°, plus de 40 visualisations interactives,
            simulateurs financiers, fiscalité, conformité — en mode clair ou sombre.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Voir le dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/simulateurs/rentabilite">
                <Eye className="h-4 w-4" /> Tester « Est-ce rentable ? »
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="p-6 transition-shadow hover:shadow-md animate-fade-in">
                <f.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© MoovIN — Plateforme de pilotage immobilier all-in-one</span>
          <span>14 modules · 48+ visualisations · WCAG AA · RGPD</span>
        </div>
      </footer>
    </div>
  );
}
