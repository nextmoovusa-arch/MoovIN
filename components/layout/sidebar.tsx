"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Euro,
  FileText,
  Folder,
  Home,
  LineChart,
  PieChart,
  Settings,
  Shield,
  Users,
  Receipt,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/biens", label: "Mes biens", icon: Building2 },
  { href: "/locataires", label: "Locataires & Baux", icon: Users },
  { href: "/loyers", label: "Suivi loyers", icon: Euro },
  { href: "/quittances", label: "Quittances", icon: Receipt },
  { href: "/documents", label: "Documents", icon: Folder },
  { href: "/simulateurs/rentabilite", label: "Rentabilité — Est-ce rentable ?", icon: Sparkles },
  { href: "/simulateurs/pret", label: "Simulateur prêt", icon: LineChart },
  { href: "/fiscalite", label: "Fiscalité", icon: FileText },
  { href: "/conformite", label: "Conformité", icon: Shield },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/portail", label: "Portail locataire", icon: User },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card sticky top-0">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <Link href="/dashboard" className="text-xl font-bold text-gradient tracking-tight">
          MoovIN
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-chart-4/10 p-3">
          <p className="text-xs font-medium text-foreground">Version MVP</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cockpit financier & locatif des investisseurs immobiliers.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function SearchTrigger() {
  return (
    <button
      className="hidden md:inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors min-w-[260px]"
      aria-label="Recherche globale"
    >
      <Search className="h-4 w-4" />
      <span>Rechercher…</span>
      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        ⌘ K
      </kbd>
    </button>
  );
}
