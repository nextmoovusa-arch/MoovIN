"use client";

import * as React from "react";
import { useLocalStorage } from "@/lib/storage";

/* -------- Types -------- */

export type BienStored = {
  id: string;
  adresse: string;
  ville: string;
  codePostal?: string;
  type: string;
  nbPieces: number;
  surface: number;
  dpe: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  prixAchat: number;
  fraisNotaire?: number;
  taxeFonciere: number;
  charges: number;
  description?: string;
  photos: string[]; // data URLs
  enTravaux?: boolean;
  lat?: number;
  lng?: number;
};

export type LocataireStored = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  bienId: string | null;
  dateEntree: string;
  dureeBailAnnees: number;
  loyerMensuel: number;
  depotGarantie: number;
  scoreFiabilite: number;
};

/* -------- Hooks publics -------- */
/* Le portefeuille démarre VIDE — aucune donnée fictive. L'utilisateur
   saisit ses propres biens et locataires. Clés versionnées (.v2) pour
   ignorer définitivement les anciennes données de démonstration. */

export function useBiens() {
  return useLocalStorage<BienStored[]>("moovin.biens.v2", []);
}

export function useLocataires() {
  return useLocalStorage<LocataireStored[]>("moovin.locataires.v2", []);
}

/* -------- Helpers dérivés -------- */

/** État opérationnel d'un bien : dérivé du locataire actif et du flag travaux. */
export function etatDuBien(
  bien: BienStored,
  locataires: LocataireStored[],
): "Occupé" | "Vacant" | "Travaux" {
  if (bien.enTravaux) return "Travaux";
  const occupant = locataires.find((l) => l.bienId === bien.id);
  return occupant ? "Occupé" : "Vacant";
}

/** Loyer mensuel actif : provient du bail en cours (si locataire attaché). */
export function loyerActifDuBien(
  bien: BienStored,
  locataires: LocataireStored[],
): number {
  const occupant = locataires.find((l) => l.bienId === bien.id);
  return occupant?.loyerMensuel ?? 0;
}

/** Rendement brut = (loyer annuel) / prix d'achat. */
export function rendementBrutDuBien(
  bien: BienStored,
  locataires: LocataireStored[],
): number {
  const loyer = loyerActifDuBien(bien, locataires);
  if (!bien.prixAchat) return 0;
  return ((loyer * 12) / bien.prixAchat) * 100;
}

/** Rendement net = (loyer annuel − charges) / (prix + notaire). */
export function rendementNetDuBien(
  bien: BienStored,
  locataires: LocataireStored[],
): number {
  const loyer = loyerActifDuBien(bien, locataires);
  const invest = bien.prixAchat + (bien.fraisNotaire ?? bien.prixAchat * 0.08);
  if (!invest) return 0;
  const annuelNet = loyer * 12 - bien.charges * 12 - bien.taxeFonciere;
  return (annuelNet / invest) * 100;
}

/** Génère un ID court lisible. */
export function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

/** Fichier → data URL (pour stocker en localStorage). */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ============================================================
   Documents — Module 6 (dépôt + catégorie + rattachement)
   ============================================================ */

export const DOC_CATEGORIES = [
  "Bail",
  "État des lieux",
  "Diagnostic / DPE",
  "Quittance",
  "Assurance PNO",
  "Facture / travaux",
  "Acte d'achat",
  "Taxe foncière",
  "Pièce d'identité",
  "Justificatif de revenus",
  "Autre",
] as const;
export type DocCategorie = (typeof DOC_CATEGORIES)[number];

export type DocumentStored = {
  id: string;
  nom: string;
  categorie: DocCategorie;
  dataUrl: string; // contenu encodé
  mime: string;
  taille: number; // octets
  dateAjout: string;
  bienId?: string | null;
  locataireId?: string | null;
};

export function useDocuments() {
  return useLocalStorage<DocumentStored[]>("moovin.documents.v1", []);
}

/* ============================================================
   Prospection — biens repérés (annonces) à analyser
   ============================================================ */

export type ProspectStored = {
  id: string;
  titre: string;
  typeBien: string; // Appartement, Maison, Studio…
  ville: string;
  codePostal?: string;
  prix?: number;
  surface?: number;
  nbPieces?: number;
  dpe?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "NC";
  loyerEstime?: number;
  lienAnnonce?: string;
  statut: "À étudier" | "Visite prévue" | "Offre faite" | "Écarté" | "Acheté";
  notes?: string;
  photos: string[];
  dateAjout: string;
};

export function useProspects() {
  return useLocalStorage<ProspectStored[]>("moovin.prospects.v1", []);
}

/** Prix au m² d'un prospect. */
export function prixM2Prospect(p: ProspectStored): number | null {
  if (!p.prix || !p.surface) return null;
  return p.prix / p.surface;
}

/* ============================================================
   Marché par ville — saisie libre de données de marché
   ============================================================ */

export type VilleStored = {
  id: string;
  nom: string;
  codePostal?: string;
  prixM2Bas?: number;
  prixM2Moyen?: number;
  prixM2Haut?: number;
  loyerM2Moyen?: number;
  rendementMoyen?: number;
  tensionLocative?: "Faible" | "Moyenne" | "Forte";
  notes?: string;
  dateMaj: string;
};

export function useVilles() {
  return useLocalStorage<VilleStored[]>("moovin.villes.v1", []);
}

/* ============================================================
   Rapprochement bancaire — détecter la réception des loyers
   ============================================================ */

export type BankConnection = {
  connected: boolean;
  banque?: string;
  iban?: string;
  dateConnexion?: string;
};

export type BankTransaction = {
  id: string;
  date: string; // ISO
  libelle: string; // émetteur / motif du virement
  montant: number; // positif = crédit reçu
};

export function useBankConnection() {
  return useLocalStorage<BankConnection>("moovin.bank.connection.v1", { connected: false });
}

export function useBankTransactions() {
  return useLocalStorage<BankTransaction[]>("moovin.bank.transactions.v1", []);
}

/** Normalise un texte pour comparaison (minuscules, sans accents/espaces superflus). */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type RapprochementResultat = {
  locataire: LocataireStored;
  attendu: number;
  transaction?: BankTransaction;
  statut: "recu" | "montant-incorrect" | "manquant";
};

/**
 * Rapproche les loyers attendus avec les virements reçus.
 * - "recu" : un virement du bon émetteur ET du bon montant existe
 * - "montant-incorrect" : un virement du bon émetteur mais montant ≠
 * - "manquant" : aucun virement identifiable
 */
export function rapprocherLoyers(
  locataires: LocataireStored[],
  transactions: BankTransaction[],
  toleranceEuros = 1,
): RapprochementResultat[] {
  return locataires.map((l) => {
    const nom = normalize(l.nom);
    // Cherche les virements dont le libellé contient le nom du locataire
    const candidats = transactions.filter(
      (t) => t.montant > 0 && normalize(t.libelle).includes(nom),
    );
    const exact = candidats.find((t) => Math.abs(t.montant - l.loyerMensuel) <= toleranceEuros);
    if (exact) {
      return { locataire: l, attendu: l.loyerMensuel, transaction: exact, statut: "recu" };
    }
    if (candidats.length > 0) {
      return {
        locataire: l,
        attendu: l.loyerMensuel,
        transaction: candidats[0],
        statut: "montant-incorrect",
      };
    }
    return { locataire: l, attendu: l.loyerMensuel, statut: "manquant" };
  });
}
