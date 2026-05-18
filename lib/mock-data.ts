/**
 * Données mockées pour la démo MoovIN.
 * Remplaçables par des appels API/DB en production.
 */

export type Bien = {
  id: string;
  adresse: string;
  ville: string;
  type: string;
  surface: number;
  prixAchat: number;
  loyerMensuel: number;
  charges: number;
  taxeFonciere: number;
  rendementBrut: number;
  rendementNet: number;
  dpe: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  etat: "Occupé" | "Vacant" | "Travaux";
  locataire?: string;
  finBail?: string;
  lat: number;
  lng: number;
};

export const biens: Bien[] = [
  {
    id: "B001",
    adresse: "12 rue de la République",
    ville: "Lyon 1er",
    type: "T2",
    surface: 45,
    prixAchat: 215000,
    loyerMensuel: 920,
    charges: 80,
    taxeFonciere: 950,
    rendementBrut: 5.13,
    rendementNet: 3.4,
    dpe: "D",
    etat: "Occupé",
    locataire: "Marie Lefèvre",
    finBail: "2027-03-15",
    lat: 45.764,
    lng: 4.835,
  },
  {
    id: "B002",
    adresse: "5 avenue Victor Hugo",
    ville: "Paris 16e",
    type: "T3",
    surface: 68,
    prixAchat: 540000,
    loyerMensuel: 1850,
    charges: 180,
    taxeFonciere: 2100,
    rendementBrut: 4.11,
    rendementNet: 2.7,
    dpe: "C",
    etat: "Occupé",
    locataire: "Antoine Garnier",
    finBail: "2026-09-01",
    lat: 48.866,
    lng: 2.275,
  },
  {
    id: "B003",
    adresse: "8 quai des Belges",
    ville: "Marseille 1er",
    type: "T1",
    surface: 28,
    prixAchat: 128000,
    loyerMensuel: 620,
    charges: 60,
    taxeFonciere: 720,
    rendementBrut: 5.81,
    rendementNet: 4.2,
    dpe: "E",
    etat: "Vacant",
    lat: 43.295,
    lng: 5.374,
  },
  {
    id: "B004",
    adresse: "22 rue du Faubourg",
    ville: "Bordeaux",
    type: "T3",
    surface: 72,
    prixAchat: 285000,
    loyerMensuel: 1180,
    charges: 110,
    taxeFonciere: 1340,
    rendementBrut: 4.97,
    rendementNet: 3.6,
    dpe: "B",
    etat: "Occupé",
    locataire: "Sophie Marchand",
    finBail: "2028-01-31",
    lat: 44.838,
    lng: -0.578,
  },
  {
    id: "B005",
    adresse: "3 rue des Capucins",
    ville: "Toulouse",
    type: "T2",
    surface: 50,
    prixAchat: 175000,
    loyerMensuel: 780,
    charges: 70,
    taxeFonciere: 880,
    rendementBrut: 5.35,
    rendementNet: 3.8,
    dpe: "C",
    etat: "Travaux",
    lat: 43.604,
    lng: 1.443,
  },
];

export type Locataire = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  bienId: string;
  dateEntree: string;
  dureeOccupationMois: number;
  scoreFiabilite: number;
};

export const locataires: Locataire[] = [
  { id: "L01", nom: "Marie Lefèvre", email: "marie.l@email.com", telephone: "06 12 34 56 78", bienId: "B001", dateEntree: "2024-03-15", dureeOccupationMois: 26, scoreFiabilite: 95 },
  { id: "L02", nom: "Antoine Garnier", email: "a.garnier@email.com", telephone: "06 23 45 67 89", bienId: "B002", dateEntree: "2023-09-01", dureeOccupationMois: 32, scoreFiabilite: 88 },
  { id: "L03", nom: "Sophie Marchand", email: "sophie.m@email.com", telephone: "06 34 56 78 90", bienId: "B004", dateEntree: "2025-01-31", dureeOccupationMois: 4, scoreFiabilite: 100 },
];

/** Évolution mensuelle cash-flow sur 24 mois pour démo. */
export const cashFlowMensuel = Array.from({ length: 24 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (23 - i));
  const base = 1200 + Math.sin(i / 3) * 400;
  const noise = (Math.random() - 0.5) * 300;
  return {
    mois: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    cashFlow: Math.round(base + noise),
    prevu: 1500,
  };
});

export const loyersPrevuVsEncaisse = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - i));
  const prevu = 5350;
  const encaisse = prevu - (Math.random() > 0.7 ? Math.round(Math.random() * 1500) : 0);
  return {
    mois: date.toLocaleDateString("fr-FR", { month: "short" }),
    prevu,
    encaisse,
  };
});

export const repartitionPatrimoine = biens.map((b) => ({
  name: `${b.type} – ${b.ville}`,
  value: b.prixAchat,
  id: b.id,
}));

export const repartitionCharges = [
  { name: "Taxe foncière", value: 5990 },
  { name: "Assurance PNO", value: 1500 },
  { name: "Copropriété", value: 4800 },
  { name: "Maintenance", value: 2400 },
  { name: "Gestion", value: 1800 },
  { name: "Intérêts prêt", value: 12400 },
];

/** Heatmap paiements 12 mois × 5 biens. */
export const heatmapPaiements = biens.map((b) => ({
  bien: `${b.type} ${b.ville}`,
  mois: Array.from({ length: 12 }, (_, m) => {
    const r = Math.random();
    return {
      label: new Date(2026, m, 1).toLocaleDateString("fr-FR", { month: "short" }),
      statut: r > 0.9 ? "impaye" : r > 0.78 ? "retard" : ("paye" as "paye" | "retard" | "impaye"),
    };
  }),
}));

export const alertesConformite = [
  { id: "A1", type: "warning", titre: "DPE de B003 (Marseille) expire dans 45j", date: "2026-07-02" },
  { id: "A2", type: "destructive", titre: "Assurance PNO B002 (Paris) expirée depuis 5j", date: "2026-05-13" },
  { id: "A3", type: "info", titre: "Révision loyer B001 (Lyon) — anniversaire 15/06", date: "2026-06-15" },
  { id: "A4", type: "warning", titre: "Bail B002 (Paris) à renouveler dans 90j", date: "2026-09-01" },
];

export const repartitionStatutsPaiement = [
  { name: "Payé à temps", value: 42 },
  { name: "Payé en retard", value: 8 },
  { name: "En attente", value: 3 },
  { name: "Impayé > 30j", value: 2 },
];

export const dpePatrimoine = [
  { classe: "A", nb: 0 },
  { classe: "B", nb: 1 },
  { classe: "C", nb: 2 },
  { classe: "D", nb: 1 },
  { classe: "E", nb: 1 },
  { classe: "F", nb: 0 },
  { classe: "G", nb: 0 },
];
