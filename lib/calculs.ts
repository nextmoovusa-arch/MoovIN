/**
 * Calculs financiers immobiliers — Module 7, 8, 12.
 * Toutes les fonctions sont pures et testables.
 */

export type MoisAmortissement = {
  mois: number;
  mensualite: number;
  partInterets: number;
  partCapital: number;
  capitalRestantDu: number;
};

/** Mensualité d'un prêt amortissable (formule standard). */
export function mensualitePret(capital: number, tauxAnnuel: number, dureeAnnees: number): number {
  if (capital <= 0 || dureeAnnees <= 0) return 0;
  const n = dureeAnnees * 12;
  const i = tauxAnnuel / 100 / 12;
  if (i === 0) return capital / n;
  return (capital * i) / (1 - Math.pow(1 + i, -n));
}

/** Tableau d'amortissement complet (Module 8). */
export function tableauAmortissement(
  capital: number,
  tauxAnnuel: number,
  dureeAnnees: number,
): MoisAmortissement[] {
  const n = dureeAnnees * 12;
  const i = tauxAnnuel / 100 / 12;
  const m = mensualitePret(capital, tauxAnnuel, dureeAnnees);
  const out: MoisAmortissement[] = [];
  let crd = capital;
  for (let mois = 1; mois <= n; mois++) {
    const partInterets = crd * i;
    const partCapital = m - partInterets;
    crd = Math.max(0, crd - partCapital);
    out.push({
      mois,
      mensualite: m,
      partInterets,
      partCapital,
      capitalRestantDu: crd,
    });
  }
  return out;
}

export type RentabiliteInputs = {
  prixAchat: number;
  fraisNotaire: number;
  travaux: number;
  loyerMensuel: number;
  chargesMensuelles: number;
  taxeFonciere: number;
  assurancePNO: number;
  vacanceLocativePct: number;
  apport: number;
  tauxPret: number;
  dureePretAnnees: number;
  tauxMarginalImpot: number;
};

export type RentabiliteOutputs = {
  investissementTotal: number;
  loyersAnnuels: number;
  chargesAnnuelles: number;
  rendementBrut: number;
  rendementNet: number;
  rendementNetApresImpots: number;
  cashFlowMensuel: number;
  effortEpargne: number;
  mensualitePret: number;
  capitalEmprunte: number;
};

/** Calculs du simulateur de rentabilité (Module 7). */
export function calculerRentabilite(inp: RentabiliteInputs): RentabiliteOutputs {
  const investissementTotal = inp.prixAchat + inp.fraisNotaire + inp.travaux;
  const capitalEmprunte = Math.max(0, investissementTotal - inp.apport);
  const mens = mensualitePret(capitalEmprunte, inp.tauxPret, inp.dureePretAnnees);
  const loyersAnnuels = inp.loyerMensuel * 12 * (1 - inp.vacanceLocativePct / 100);
  const chargesAnnuelles =
    inp.chargesMensuelles * 12 + inp.taxeFonciere + inp.assurancePNO;
  const rendementBrut = (inp.loyerMensuel * 12) / inp.prixAchat * 100;
  const rendementNet =
    ((loyersAnnuels - chargesAnnuelles) / investissementTotal) * 100;
  const rendementNetApresImpots =
    rendementNet * (1 - inp.tauxMarginalImpot / 100);
  const cashFlowMensuel =
    inp.loyerMensuel - inp.chargesMensuelles - inp.taxeFonciere / 12 - inp.assurancePNO / 12 - mens;
  const effortEpargne = (inp.apport / investissementTotal) * 100;

  return {
    investissementTotal,
    loyersAnnuels,
    chargesAnnuelles,
    rendementBrut,
    rendementNet,
    rendementNetApresImpots,
    cashFlowMensuel,
    effortEpargne,
    mensualitePret: mens,
    capitalEmprunte,
  };
}

/** Note d'investissement /100 — Module 12. */
export function noteInvestissement(o: RentabiliteOutputs): number {
  const rendementScore = Math.min(100, Math.max(0, (o.rendementNet / 6) * 100)) * 0.5;
  const risqueScore = (o.cashFlowMensuel >= 0 ? 100 : 50) * 0.2;
  const localisationScore = 70 * 0.15;
  const evolScore = 75 * 0.15;
  return Math.round(rendementScore + risqueScore + localisationScore + evolScore);
}

/** Verdict simple à partir de la note. */
export function verdictInvestissement(note: number): {
  label: string;
  color: "success" | "warning" | "destructive";
} {
  if (note >= 70) return { label: "Excellent investissement", color: "success" };
  if (note >= 50) return { label: "Investissement correct", color: "warning" };
  return { label: "Investissement risqué", color: "destructive" };
}
