"use client";

import * as React from "react";
import { useLocalStorage } from "@/lib/storage";
import { biens as biensSeed, locataires as locatairesSeed } from "@/lib/mock-data";

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

/* -------- Bootstrap depuis les mocks (1ʳᵉ visite) -------- */

const seedBiens = (): BienStored[] =>
  biensSeed.map((b) => ({
    id: b.id,
    adresse: b.adresse,
    ville: b.ville,
    type: b.type,
    nbPieces: parseInt(b.type.replace(/[^0-9]/g, "")) || 1,
    surface: b.surface,
    dpe: b.dpe,
    prixAchat: b.prixAchat,
    taxeFonciere: b.taxeFonciere,
    charges: b.charges,
    photos: [],
    enTravaux: b.etat === "Travaux",
    lat: b.lat,
    lng: b.lng,
  }));

const seedLocataires = (): LocataireStored[] =>
  locatairesSeed.map((l) => {
    const bien = biensSeed.find((b) => b.id === l.bienId);
    return {
      id: l.id,
      nom: l.nom,
      email: l.email,
      telephone: l.telephone,
      bienId: l.bienId,
      dateEntree: l.dateEntree,
      dureeBailAnnees: 3,
      loyerMensuel: bien?.loyerMensuel ?? 0,
      depotGarantie: (bien?.loyerMensuel ?? 0) * 2,
      scoreFiabilite: l.scoreFiabilite,
    };
  });

/* -------- Hooks publics -------- */

export function useBiens() {
  return useLocalStorage<BienStored[]>("moovin.biens", seedBiens());
}

export function useLocataires() {
  return useLocalStorage<LocataireStored[]>("moovin.locataires", seedLocataires());
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
