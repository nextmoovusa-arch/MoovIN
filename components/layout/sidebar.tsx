"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Euro,
  FileText,
  Folder,
  Home,
  Landmark,
  LineChart,
  MapPin,
  PieChart,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavChild = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
};

/**
 * Navigation à 5 catégories principales. Le reste des modules est rangé
 * dans des sous-menus déroulants pour alléger le menu.
 */
const navGroups: NavGroup[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  {
    href: "/biens",
    label: "Mes biens",
    icon: Building2,
    children: [
      { href: "/prospects", label: "Prospection", icon: Target },
      { href: "/villes", label: "Marché par ville", icon: MapPin },
      { href: "/simulateurs/rentabilite", label: "Simulateur rentabilité", icon: Sparkles },
      { href: "/simulateurs/pret", label: "Simulateur prêt", icon: LineChart },
    ],
  },
  {
    href: "/locataires",
    label: "Mes locataires",
    icon: Users,
    children: [
      { href: "/loyers", label: "Suivi loyers", icon: Euro },
      { href: "/banque", label: "Rapprochement bancaire", icon: Landmark },
      { href: "/quittances", label: "Quittances", icon: Receipt },
      { href: "/portail", label: "Portail locataire", icon: Users },
    ],
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: PieChart,
    children: [
      { href: "/fiscalite", label: "Fiscalité", icon: FileText },
      { href: "/conformite", label: "Conformité", icon: Shield },
    ],
  },
  { href: "/documents", label: "Documents", icon: Folder },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

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
          {navGroups.map((group) => (
            <NavGroupItem key={group.href} group={group} pathname={pathname} />
          ))}
        </ul>
      </nav>

      <div className="border-t p-3">
        <Link
          href="/parametres"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(pathname, "/parametres")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}

function NavGroupItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const Icon = group.icon;
  const groupActive = isActive(pathname, group.href);
  const childActive = group.children?.some((c) => isActive(pathname, c.href)) ?? false;
  const [open, setOpen] = React.useState(groupActive || childActive);

  // Ouvre automatiquement le groupe contenant la page active
  React.useEffect(() => {
    if (groupActive || childActive) setOpen(true);
  }, [groupActive, childActive]);

  return (
    <li>
      <div
        className={cn(
          "flex items-center rounded-md transition-colors",
          groupActive ? "bg-primary/10" : "hover:bg-accent",
        )}
      >
        <Link
          href={group.href}
          className={cn(
            "flex flex-1 items-center gap-3 px-3 py-2 text-sm font-medium",
            groupActive ? "text-primary" : childActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>{group.label}</span>
        </Link>
        {group.children && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Réduire" : "Déployer"}
            className="px-2 py-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>

      {group.children && open && (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l pl-3">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            const active = isActive(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
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
