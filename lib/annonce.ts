import { BienStored } from "@/lib/store";

/**
 * Génère un texte d'annonce immobilière prêt à copier-coller
 * (Leboncoin, SeLoger, vitrine…) à partir d'une fiche bien.
 */
export function genererAnnonce(
  bien: BienStored,
  opts: { loyer?: number; meuble?: boolean } = {},
): string {
  const loyer = opts.loyer ?? 0;
  const lignes: string[] = [];

  const titre = `${bien.type} de ${bien.surface} m² à louer — ${bien.ville}`;
  lignes.push(titre.toUpperCase());
  lignes.push("");

  lignes.push(
    `À louer : ${bien.type}${bien.nbPieces ? ` (${bien.nbPieces} pièce${bien.nbPieces > 1 ? "s" : ""})` : ""} de ${bien.surface} m², ` +
      `situé ${bien.adresse}, ${bien.ville}${bien.codePostal ? ` (${bien.codePostal})` : ""}.`,
  );
  lignes.push("");

  lignes.push("CARACTÉRISTIQUES");
  lignes.push(`• Type : ${bien.type}`);
  if (bien.nbPieces) lignes.push(`• Nombre de pièces : ${bien.nbPieces}`);
  lignes.push(`• Surface habitable : ${bien.surface} m²`);
  lignes.push(`• Classe énergétique (DPE) : ${bien.dpe}`);
  if (opts.meuble !== undefined) lignes.push(`• Meublé : ${opts.meuble ? "oui" : "non"}`);
  lignes.push("");

  if (loyer > 0) {
    lignes.push("CONDITIONS FINANCIÈRES");
    lignes.push(`• Loyer mensuel : ${loyer} € hors charges`);
    if (bien.charges) lignes.push(`• Provision sur charges : ${bien.charges} € / mois`);
    lignes.push(`• Total mensuel : ${loyer + (bien.charges || 0)} €`);
    lignes.push("");
  }

  if (bien.description) {
    lignes.push("DESCRIPTION");
    lignes.push(bien.description);
    lignes.push("");
  }

  lignes.push("Disponibilité : nous consulter.");
  lignes.push("Contact via la messagerie de l'annonce.");

  return lignes.join("\n");
}
