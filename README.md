# MoovIN — Plateforme de pilotage immobilier

> Le cockpit financier et locatif des investisseurs immobiliers.
> Implémentation du cahier des charges v2.0 (CDC_Plateforme_Pilotage_Immobilier_v2).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (`darkMode: 'class'`) + design tokens via variables CSS
- **shadcn/ui-style** primitives (Radix UI)
- **Recharts** + couche d'abstraction **ChartKit** (Module 13)
- **next-themes** + script anti-FOUC (Module 14)
- **Framer Motion / Lucide / class-variance-authority**

## Architecture des modules

```
app/
├── layout.tsx                    # Anti-FOUC + ThemeProvider (Module 14.7.3)
├── globals.css                   # Tokens clair / sombre (Module 14.3/14.4)
├── page.tsx                      # Landing / hero
└── (app)/                        # Groupe authentifié : sidebar + topbar
    ├── layout.tsx
    ├── dashboard/                # Module 1 — Tableau de bord (7 viz)
    ├── biens/                    # Module 2 — Gestion des biens
    ├── locataires/               # Module 3 — Locataires & baux
    ├── loyers/                   # Module 4 — Suivi loyers / impayés
    ├── quittances/               # Module 5 — Quittances
    ├── documents/                # Module 6 — Documents
    ├── simulateurs/
    │   ├── rentabilite/          # Module 7 — Simulateur rentabilité
    │   ├── pret/                 # Module 8 — Simulateur prêt
    │   └── investissement/       # Module 12 — Est-ce rentable ?
    ├── fiscalite/                # Module 9
    ├── conformite/               # Module 10
    ├── analytics/                # Module 13 — Centre de visualisation
    └── parametres/               # Module 14 — Thématisation

components/
├── theme/                        # Provider + Toggle (Sun/Moon/Monitor)
├── layout/                       # Sidebar, Topbar, PageHeader
├── ui/                           # Button, Card, Badge, Tabs, DropdownMenu
├── charts/chart-kit.tsx          # API unifiée — line/area, donut, bars,
│                                 #   gauges, heatmap, radar, sparkline,
│                                 #   stacked area, horizontal bars
└── dashboard/stat-card.tsx       # Carte KPI animée + sparkline

lib/
├── utils.ts                      # cn, formatEUR, formatPct
├── calculs.ts                    # Mensualité, amortissement, rentabilité,
│                                 #   note d'investissement /100
└── mock-data.ts                  # Biens, locataires, paiements, alertes
```

## Modules livrés (MVP)

| Module | Statut | Visualisations clés |
|---|---|---|
| 1 — Tableau de bord | ✅ | 4 stat cards + sparkline, line cash-flow, donut patrimoine, donut charges, bars loyers prévus/encaissés, 4 jauges radiales, heatmap paiements, alertes |
| 2 — Mes biens | ✅ | Donut types, bars DPE, tableau + sparkline par ligne, badges rendement & DPE |
| 3 — Locataires & baux | ✅ | Pyramide horizontale, donut motifs départ, liste avec scores |
| 4 — Suivi loyers | ✅ | Aire taux recouvrement, donut statuts, top risque horizontal, comparateur prévus/encaissés |
| 5 — Quittances | ✅ | Bars statut envoi, aire cumul annuel |
| 6 — Documents | ✅ | 5 jauges score conformité, bars activité |
| 7 — Simulateur rentabilité | ✅ | 3 jauges, projection 25 ans, donut charges, comparateur scénarios |
| 8 — Simulateur prêt | ✅ | Donut décomposition, pyramide stacked area, CRD, tableau amortissement |
| 9 — Fiscalité | ✅ | Comparateur 3 régimes, donut charges déductibles, projection 10 ans |
| 10 — Conformité | ✅ | 6 jauges (global + 5 sous), bars DPE, échéances |
| 12 — Est-ce rentable ? | ✅ | Verdict XL coloré + note /100, radar 5 axes, projection patrimoine |
| 13 — Analytics | ✅ | 3 donuts + radar santé, cash-flow cumulé, ventilation, heatmap |
| 14 — Thématisation | ✅ | Clair / Sombre / Système, anti-FOUC, raccourci ⌘⇧L, persistance localStorage |
| 11 — Espace locataire | ⬜ Phase 2 | (portail dédié, hors MVP) |

## Système de design (extrait)

- **Mode clair** : fond `#FFFFFF`, surface `#F8FAFC`, texte `#0F172A`, primaire bleu `#3B82F6`
- **Mode sombre** : fond `#0B1220` (gris sombre bleuté style GitHub/Linear/Notion), texte `#F8FAFC`
- **Palette catégorielle** ChartKit : 10 teintes accessibles, déclinées par thème
- **Couleurs sémantiques** : succès `#10B981`, avertissement `#F59E0B`, erreur `#EF4444`
- **Anti-FOUC** : script inline dans `<head>` lit `localStorage.theme` avant tout rendu
- **`prefers-reduced-motion`** : transitions désactivées si demandé par l'OS
- **Accessibilité** : focus ring sur tous les interactifs, contrastes WCAG AA, navigation clavier

## Lancement local

```bash
npm install
npm run dev
# http://localhost:3000
```

## Déploiement Vercel (nouveau projet « MoovIN »)

### Option A — Vercel + GitHub (recommandé, 1 clic)

1. La branche `claude/build-moovIN-app-jnyQd` est déjà poussée sur GitHub.
2. Sur https://vercel.com/new sélectionnez le repo **`nextmoovusa-arch/moovin`**.
3. **Project Name** : `moovin`
4. **Framework Preset** : Next.js (détecté automatiquement)
5. **Branch** : `claude/build-moovIN-app-jnyQd` (ou mergez d'abord sur `main`)
6. Aucune variable d'environnement requise pour le MVP (données mockées).
7. Cliquez **Deploy** — déploiement en ~90 secondes.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel              # 1er deploy : crée le projet "moovin"
vercel --prod       # promotion en production
```

## Prochaines étapes (Phase 2+)

- Authentification (NextAuth / JWT + MFA)
- Backend Node.js / PostgreSQL (biens, locataires, paiements, documents)
- Stockage documents S3 + OCR
- Espace locataire (Module 11)
- Cartes géographiques (Mapbox)
- Treemaps / Sankey (Visx / D3)
- Export PDF avec graphiques HD (Puppeteer + ChartKit côté serveur)
- Workers calculs intensifs (Bull/BullMQ)
- Tests : Vitest, Cypress, Chromatic (visual regression)
- Integration paiement en ligne (Stripe)
- API experts-comptables

## Conformité au CDC v2.0

- ✅ 14 modules architecturés
- ✅ Module 13 — ChartKit avec API unifiée + thème dynamique
- ✅ Module 14 — Double thème, anti-FOUC, raccourci clavier, persistance
- ✅ KPIs / sparklines / jauges / heatmaps / radars / donuts / aires
- ✅ Sidebar 13 entrées + topbar avec recherche, notifications, bascule thème
- ✅ Calculs financiers réels (mensualité, amortissement, rentabilité, note /100)
- ✅ WCAG AA : contrastes, focus ring, alternatives texte, `prefers-reduced-motion`
- ⬜ Backend, auth, persistance — Phase 2
