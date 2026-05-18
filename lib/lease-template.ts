/**
 * Générateur de templates de bail pré-remplis.
 * Simplifié — en production : vrais modèles officiels (loi ALUR, meublé, mobilité...).
 */

export type LeaseInputs = {
  bailleurNom: string;
  bailleurAdresse: string;
  locataireNom: string;
  locataireEmail: string;
  bienAdresse: string;
  bienType: string;
  bienSurface: number;
  loyerMensuel: number;
  charges: number;
  depotGarantie: number;
  dateDebut: string;
  dureeAnnees: number;
};

export type LeaseTemplateId = "vide-non-meuble" | "vide-mobilite" | "meuble";

export const LEASE_TEMPLATES: { id: LeaseTemplateId; label: string; description: string }[] = [
  {
    id: "vide-non-meuble",
    label: "Location vide — Résidence principale",
    description: "Bail loi du 6 juillet 1989 (loi ALUR). Durée : 3 ans (6 ans si personne morale).",
  },
  {
    id: "meuble",
    label: "Location meublée — Résidence principale",
    description: "Bail meublé, durée : 1 an (9 mois étudiant). Liste mobilier obligatoire.",
  },
  {
    id: "vide-mobilite",
    label: "Bail mobilité",
    description: "Logement meublé, 1 à 10 mois, non renouvelable. Public spécifique.",
  },
];

export function generateLeaseText(template: LeaseTemplateId, i: LeaseInputs): string {
  const dateDebut = new Date(i.dateDebut).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const dateFin = (() => {
    const d = new Date(i.dateDebut);
    d.setFullYear(d.getFullYear() + i.dureeAnnees);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  })();

  const tplLabel = LEASE_TEMPLATES.find((t) => t.id === template)?.label ?? "";

  return `
CONTRAT DE BAIL D'HABITATION
${tplLabel.toUpperCase()}

ENTRE LES SOUSSIGNÉS

LE BAILLEUR :
${i.bailleurNom || "[Nom du bailleur]"}
Demeurant : ${i.bailleurAdresse || "[Adresse du bailleur]"}

ET

LE LOCATAIRE :
${i.locataireNom || "[Nom du locataire]"}
Email : ${i.locataireEmail || "[Email]"}

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 — Objet du bail
Le bailleur donne à bail au locataire, qui accepte, le logement situé :
${i.bienAdresse || "[Adresse du bien]"}
Type : ${i.bienType || "[Type]"} — Surface habitable : ${i.bienSurface || 0} m²

Article 2 — Durée
Le présent bail est consenti pour une durée de ${i.dureeAnnees} an(s), à compter
du ${dateDebut}, prenant fin le ${dateFin}. Il se renouvelle par tacite reconduction
dans les conditions prévues par la loi du 6 juillet 1989.

Article 3 — Loyer et charges
Le loyer mensuel est fixé à ${i.loyerMensuel} € hors charges.
Les charges récupérables, payables par provisions, s'élèvent à ${i.charges} € / mois.
Total mensuel : ${i.loyerMensuel + i.charges} €, payable d'avance le 5 de chaque mois.

Article 4 — Dépôt de garantie
Le locataire verse, à la signature, un dépôt de garantie de ${i.depotGarantie} €,
restituable dans un délai maximum de deux mois après restitution des clés, déduction
faite des sommes dues et des éventuelles dégradations.

Article 5 — État des lieux
Un état des lieux contradictoire est établi à l'entrée et à la sortie du locataire.

Article 6 — Obligations du locataire
Le locataire s'engage à user paisiblement du logement, à régler ponctuellement
le loyer et les charges, à souscrire une assurance habitation, à entretenir
le logement et à ne pas y exercer d'activité commerciale.

Article 7 — Obligations du bailleur
Le bailleur s'engage à délivrer un logement décent, en bon état d'usage, et à
en assurer la jouissance paisible. Il prend en charge les grosses réparations.

Article 8 — Diagnostics
Sont annexés au présent bail : DPE, diagnostic plomb, amiante (si applicable),
état des risques et pollutions.

Fait à _____________________, le _____________________
en deux exemplaires originaux.

Le bailleur                                       Le locataire
${i.bailleurNom || "[Nom]"}                       ${i.locataireNom || "[Nom]"}
(signature précédée de la mention « lu et approuvé »)
`.trim();
}
