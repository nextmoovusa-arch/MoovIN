/**
 * Données dérivées — calculées à partir des biens et locataires RÉELS du store.
 * Aucune donnée fictive : si le portefeuille est vide, ces fonctions
 * renvoient des tableaux vides → les pages affichent un état vide.
 */

import {
  BienStored,
  LocataireStored,
  etatDuBien,
  loyerActifDuBien,
  rendementBrutDuBien,
  rendementNetDuBien,
} from "@/lib/store";

/* -------- KPIs globaux -------- */

export function valeurPatrimoine(biens: BienStored[]): number {
  return biens.reduce((s, b) => s + b.prixAchat, 0);
}

export function loyersDuMois(biens: BienStored[], locataires: LocataireStored[]): number {
  return biens.reduce((s, b) => s + loyerActifDuBien(b, locataires), 0);
}

export function rendementNetMoyen(biens: BienStored[], locataires: LocataireStored[]): number {
  const occupes = biens.filter((b) => loyerActifDuBien(b, locataires) > 0);
  if (occupes.length === 0) return 0;
  return occupes.reduce((s, b) => s + rendementNetDuBien(b, locataires), 0) / occupes.length;
}

export function rendementBrutMoyen(biens: BienStored[], locataires: LocataireStored[]): number {
  const occupes = biens.filter((b) => loyerActifDuBien(b, locataires) > 0);
  if (occupes.length === 0) return 0;
  return occupes.reduce((s, b) => s + rendementBrutDuBien(b, locataires), 0) / occupes.length;
}

export function tauxOccupation(biens: BienStored[], locataires: LocataireStored[]): number {
  if (biens.length === 0) return 0;
  const occupes = biens.filter((b) => etatDuBien(b, locataires) === "Occupé").length;
  return (occupes / biens.length) * 100;
}

/* -------- Répartitions (camemberts / barres) -------- */

export function repartitionPatrimoine(biens: BienStored[]) {
  return biens.map((b) => ({
    name: `${b.type} – ${b.ville}`,
    value: b.prixAchat,
    id: b.id,
  }));
}

export function repartitionParType(biens: BienStored[]) {
  const map = biens.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/** Décomposition réelle des charges annuelles du portefeuille. */
export function repartitionCharges(biens: BienStored[]) {
  const taxeFonciere = biens.reduce((s, b) => s + (b.taxeFonciere || 0), 0);
  const chargesCourantes = biens.reduce((s, b) => s + (b.charges || 0) * 12, 0);
  const out = [
    { name: "Taxe foncière", value: taxeFonciere },
    { name: "Charges courantes", value: chargesCourantes },
  ].filter((x) => x.value > 0);
  return out;
}

export function dpePatrimoine(biens: BienStored[]) {
  const classes = ["A", "B", "C", "D", "E", "F", "G"] as const;
  return classes.map((classe) => ({
    classe,
    nb: biens.filter((b) => b.dpe === classe).length,
  }));
}

/* -------- Heatmap des paiements (12 mois × biens) -------- */

type PaymentStatut = "paye" | "retard" | "impaye" | "vacant";

/**
 * Construit la heatmap à partir des paiements réels enregistrés par les
 * locataires dans le portail (localStorage `moovin.paiements.{id}`).
 * Un mois est "payé" si un paiement existe pour ce mois, "vacant" si pas
 * de locataire, sinon "impaye" (aucun paiement enregistré alors qu'occupé).
 */
export function heatmapPaiements(
  biens: BienStored[],
  locataires: LocataireStored[],
  paiementsParLocataire: Record<string, { mois: string }[]>,
) {
  const moisLabels = Array.from({ length: 12 }, (_, m) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - m));
    return {
      court: d.toLocaleDateString("fr-FR", { month: "short" }),
      long: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    };
  });

  return biens.map((b) => {
    const occupant = locataires.find((l) => l.bienId === b.id);
    const paiements = occupant ? paiementsParLocataire[occupant.id] ?? [] : [];
    return {
      bien: `${b.type} ${b.ville}`,
      mois: moisLabels.map((ml) => {
        if (!occupant) return { label: ml.court, statut: "vacant" as PaymentStatut };
        const paye = paiements.some((p) => p.mois?.toLowerCase() === ml.long.toLowerCase());
        return { label: ml.court, statut: (paye ? "paye" : "impaye") as PaymentStatut };
      }),
    };
  });
}

/* -------- Alertes de conformité (calculées sur baux + DPE) -------- */

export type AlerteConformite = {
  id: string;
  type: "warning" | "destructive" | "info";
  titre: string;
  date: string;
};

export function alertesConformite(
  biens: BienStored[],
  locataires: LocataireStored[],
): AlerteConformite[] {
  const alertes: AlerteConformite[] = [];
  const now = new Date();

  // DPE défavorable (F/G interdits ou bientôt interdits)
  for (const b of biens) {
    if (b.dpe === "G") {
      alertes.push({
        id: `dpe-${b.id}`,
        type: "destructive",
        titre: `DPE classe G — ${b.adresse} (${b.ville}) : interdit à la location`,
        date: now.toISOString().slice(0, 10),
      });
    } else if (b.dpe === "F") {
      alertes.push({
        id: `dpe-${b.id}`,
        type: "warning",
        titre: `DPE classe F — ${b.adresse} (${b.ville}) : interdit en 2028`,
        date: now.toISOString().slice(0, 10),
      });
    }
  }

  // Fin de bail proche (< 90 jours)
  for (const l of locataires) {
    const bien = biens.find((b) => b.id === l.bienId);
    if (!bien) continue;
    const fin = new Date(l.dateEntree);
    fin.setFullYear(fin.getFullYear() + (l.dureeBailAnnees || 3));
    const joursRestants = Math.round((fin.getTime() - now.getTime()) / 86400000);
    if (joursRestants >= 0 && joursRestants <= 90) {
      alertes.push({
        id: `bail-${l.id}`,
        type: "warning",
        titre: `Bail de ${l.nom} (${bien.ville}) à renouveler dans ${joursRestants} j`,
        date: fin.toISOString().slice(0, 10),
      });
    }
  }

  return alertes;
}

/* -------- Score de conformité documentaire (réel = inconnu → 0) -------- */
/* Renvoie null tant qu'aucun document n'est rattaché. Les pages affichent un état vide. */
