"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ParametresPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Préférences utilisateur, apparence, notifications, sécurité."
        badge="Module 14 — Thématisation"
      />

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>
            Mode clair, sombre ou suivi du système. Raccourci :{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">⌘ ⇧ L</kbd>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { v: "light", label: "Clair", icon: Sun, desc: "Fond blanc, idéal en journée." },
              { v: "dark", label: "Sombre", icon: Moon, desc: "Gris bleuté, confort en soirée." },
              { v: "system", label: "Système", icon: Monitor, desc: "Suit la préférence de l'OS." },
            ].map((opt) => {
              const active = mounted && theme === opt.v;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setTheme(opt.v)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "hover:border-primary/40"
                  }`}
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 font-semibold">{opt.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Email, push, in-app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Alertes de conformité, échéances bail, impayés, révision loyer.</p>
          <Button variant="outline">Configurer les notifications</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données &amp; RGPD</CardTitle>
          <CardDescription>Export, droit à l'oubli, portabilité</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">Exporter mes données</Button>
          <Button variant="outline">Politique de confidentialité</Button>
          <Button variant="destructive">Supprimer mon compte</Button>
        </CardContent>
      </Card>
    </div>
  );
}
