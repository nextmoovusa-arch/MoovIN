/**
 * Modèles de bail enrichis — vide, meublé, mobilité.
 * Articles inspirés des modèles types (décret n° 2015-587, loi 6 juillet 1989).
 * À titre informatif — faire valider par un professionnel pour une utilisation réelle.
 */

export type LeaseInputs = {
  bailleurNom: string;
  bailleurAdresse: string;
  bailleurEmail?: string;
  locataireNom: string;
  locataireEmail: string;
  locataireTelephone?: string;
  bienAdresse: string;
  bienType: string;
  bienSurface: number;
  bienNbPieces?: number;
  loyerMensuel: number;
  charges: number;
  depotGarantie: number;
  dateDebut: string;
  dureeAnnees: number;
  honoraires?: number;
  indexIRL?: string;
  zoneTendue?: boolean;
};

export type LeaseTemplateId = "vide-non-meuble" | "vide-mobilite" | "meuble";

export const LEASE_TEMPLATES: { id: LeaseTemplateId; label: string; description: string }[] = [
  {
    id: "vide-non-meuble",
    label: "Location vide — Résidence principale (loi du 6 juillet 1989)",
    description: "Bail le plus répandu. Durée : 3 ans (6 ans si bailleur personne morale).",
  },
  {
    id: "meuble",
    label: "Location meublée — Résidence principale",
    description: "Bail meublé. Durée : 1 an (9 mois si étudiant). Liste mobilier obligatoire.",
  },
  {
    id: "vide-mobilite",
    label: "Bail mobilité (logement meublé)",
    description: "Mobilité professionnelle, 1 à 10 mois, non renouvelable, pas de dépôt de garantie.",
  },
];

/** Article = numéro + titre + texte. Le texte peut contenir des variables {{var}}. */
export type LeaseArticle = { numero: string; titre: string; texte: string };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const addYears = (iso: string, years: number) => {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + years);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

const addMonths = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);

/** Génère la liste des articles pour un template donné. */
export function generateLeaseArticles(template: LeaseTemplateId, i: LeaseInputs): LeaseArticle[] {
  const isMobilite = template === "vide-mobilite";
  const isMeuble = template === "meuble" || template === "vide-mobilite";

  const dateDebut = fmtDate(i.dateDebut);
  const dateFin = isMobilite
    ? addMonths(i.dateDebut, Math.max(1, Math.min(10, i.dureeAnnees * 12)))
    : addYears(i.dateDebut, i.dureeAnnees);

  const dureeText = isMobilite
    ? `${i.dureeAnnees * 12} mois (bail mobilité, non renouvelable)`
    : `${i.dureeAnnees} an(s)`;

  const totalMensuel = i.loyerMensuel + i.charges;

  const articles: LeaseArticle[] = [
    {
      numero: "1",
      titre: "Désignation des parties",
      texte: `Le présent contrat est conclu entre :

LE BAILLEUR : ${i.bailleurNom || "[Nom du bailleur]"}, demeurant ${i.bailleurAdresse || "[Adresse du bailleur]"}${i.bailleurEmail ? `, joignable à ${i.bailleurEmail}` : ""}.

LE LOCATAIRE : ${i.locataireNom}, joignable à ${i.locataireEmail}${i.locataireTelephone ? ` (tél. ${i.locataireTelephone})` : ""}, ci-après dénommé(e) « le locataire ».

Les parties ont arrêté et conclu ce qui suit.`,
    },
    {
      numero: "2",
      titre: "Objet et désignation du logement",
      texte: `Le bailleur donne à bail au locataire, qui l'accepte, un logement à usage exclusif d'habitation et de résidence principale, situé : ${i.bienAdresse}.

Type : ${i.bienType}${i.bienNbPieces ? ` — ${i.bienNbPieces} pièce(s) principale(s)` : ""}.
Surface habitable (loi Boutin) : ${i.bienSurface} m².
Le logement est loué ${isMeuble ? "MEUBLÉ" : "NON MEUBLÉ"}. ${isMeuble ? "Une liste descriptive et chiffrée du mobilier, annexée au présent bail, fait foi entre les parties." : ""}`,
    },
    {
      numero: "3",
      titre: "Destination du logement",
      texte: `Le logement loué est destiné à l'usage exclusif d'habitation et de résidence principale du locataire. Le locataire ne pourra ni exercer une activité commerciale, industrielle, artisanale ou libérale dans les lieux, ni en changer la destination sans l'accord écrit du bailleur, sauf à exercer une activité professionnelle au sens de la jurisprudence (pas de réception de clientèle).`,
    },
    {
      numero: "4",
      titre: "Durée du bail",
      texte: `Le présent bail est consenti pour une durée de ${dureeText}, à compter du ${dateDebut}, et prendra fin de plein droit le ${dateFin}.
${
  isMobilite
    ? "Conformément à l'article 25-12 de la loi du 6 juillet 1989, le bail mobilité n'est pas renouvelable et ne peut être tacitement reconduit."
    : "À défaut de congé délivré par l'une des parties dans les conditions prévues aux articles 12 et 15 de la loi du 6 juillet 1989, le bail sera reconduit tacitement pour la même durée."
}`,
    },
    {
      numero: "5",
      titre: "Loyer et modalités de paiement",
      texte: `Le loyer mensuel hors charges est fixé à ${fmtEUR(i.loyerMensuel)}.
Les charges récupérables, payables par provisions mensuelles avec régularisation annuelle, s'élèvent à ${fmtEUR(i.charges)} par mois.
Le loyer et les provisions sur charges, soit ${fmtEUR(totalMensuel)} au total, sont payables d'avance le 5 de chaque mois, par virement bancaire ou prélèvement automatique sur le compte communiqué par le bailleur.

Tout retard de paiement supérieur à 8 jours pourra entraîner l'application d'intérêts au taux légal en vigueur.`,
    },
    ...(!isMobilite
      ? [
          {
            numero: "6",
            titre: "Révision annuelle du loyer (indice IRL)",
            texte: `Le loyer sera révisé chaque année à la date anniversaire du bail, soit le ${new Date(i.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}, en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE.
Indice de référence retenu : ${i.indexIRL || "dernier indice connu au jour de la signature"}.

Cette révision est de plein droit ; le bailleur en informera le locataire par lettre simple. À défaut de manifestation du bailleur dans l'année suivant la date à laquelle la révision pouvait intervenir, le loyer reste maintenu.${i.zoneTendue ? "\n\nLe logement étant situé en zone tendue, l'augmentation lors du renouvellement est strictement encadrée." : ""}`,
          },
        ]
      : []),
    ...(!isMobilite
      ? [
          {
            numero: "7",
            titre: "Dépôt de garantie",
            texte: `Le locataire verse à la signature du présent bail un dépôt de garantie d'un montant de ${fmtEUR(i.depotGarantie)}, correspondant à ${isMeuble ? "deux mois" : "un mois"} de loyer hors charges.
Ce dépôt ne portera pas intérêts au bénéfice du locataire. Il sera restitué dans un délai maximum de deux mois après restitution des clés et établissement de l'état des lieux de sortie, déduction faite, le cas échéant, des sommes restant dues au bailleur et du coût justifié des réparations locatives.

Le délai est ramené à un mois lorsque l'état des lieux de sortie est conforme à l'état des lieux d'entrée.`,
          },
        ]
      : [
          {
            numero: "7",
            titre: "Garantie (bail mobilité)",
            texte: `Conformément à la loi, aucun dépôt de garantie ne peut être exigé dans le cadre d'un bail mobilité. Le bailleur peut néanmoins demander au locataire de fournir une caution (notamment via Visale).`,
          },
        ]),
    {
      numero: "8",
      titre: "État des lieux et inventaire",
      texte: `Un état des lieux contradictoire et amiable est établi à l'entrée et à la sortie du locataire. À défaut, il pourra être dressé par huissier de justice à frais partagés.
${isMeuble ? "Un inventaire détaillé et chiffré du mobilier, signé par les parties, est annexé au présent bail." : ""}
Pendant le premier mois de la période de chauffe, le locataire peut demander à compléter l'état des lieux en ce qui concerne les éléments de chauffage.`,
    },
    {
      numero: "9",
      titre: "Obligations du locataire",
      texte: `Le locataire s'oblige à :
- payer le loyer et les charges aux termes convenus ;
- user paisiblement des lieux loués suivant la destination prévue à l'article 3 ;
- répondre des dégradations et pertes survenant pendant la durée du contrat, sauf s'il prouve qu'elles ont eu lieu par cas de force majeure, par la faute du bailleur ou par le fait d'un tiers ;
- prendre à sa charge l'entretien courant du logement et des équipements et les menues réparations (cf. décret n° 87-712) ;
- ne pas transformer les locaux et équipements loués sans l'accord écrit du bailleur ;
- laisser exécuter dans les lieux loués les travaux d'amélioration des parties communes ou privatives et les travaux nécessaires au maintien en état du logement ;
- s'assurer contre les risques locatifs (incendie, dégâts des eaux, explosion) et en justifier chaque année au bailleur (article 11).`,
    },
    {
      numero: "10",
      titre: "Obligations du bailleur",
      texte: `Le bailleur est obligé :
- de délivrer au locataire un logement décent, en bon état d'usage et de réparation ;
- d'assurer la jouissance paisible du logement et garantir contre les vices ou défauts qui en empêcheraient l'usage ;
- d'entretenir les locaux en état de servir à l'usage prévu et y faire toutes les réparations autres que locatives ;
- de ne pas s'opposer aux aménagements réalisés par le locataire dès lors que ceux-ci ne constituent pas une transformation de la chose louée ;
- de remettre gratuitement au locataire une quittance pour les sommes payées par celui-ci, dès lors qu'il en fait la demande.`,
    },
    {
      numero: "11",
      titre: "Assurance habitation",
      texte: `Le locataire est tenu de souscrire un contrat d'assurance couvrant les risques locatifs (incendie, explosion, dégâts des eaux) avant l'entrée dans les lieux, et de remettre annuellement au bailleur l'attestation correspondante.
À défaut de production de cette attestation après mise en demeure restée infructueuse pendant un mois, le bailleur peut, à son choix, souscrire pour le compte du locataire et récupérer le coût ou résilier le bail.`,
    },
    {
      numero: "12",
      titre: "Sous-location et cession",
      texte: `Le locataire ne peut sous-louer le logement, en tout ou partie, ni céder le contrat sans l'accord écrit préalable du bailleur, y compris sur le prix du loyer. Le prix du loyer au m² des locaux sous-loués ne peut excéder celui payé par le locataire principal.
La sous-location à des plateformes de courte durée (type Airbnb) sans accord du bailleur et, le cas échéant, sans déclaration en mairie, est strictement interdite.`,
    },
    {
      numero: "13",
      titre: "Clause résolutoire",
      texte: `Le présent bail sera résilié de plein droit, et sans qu'il soit besoin d'aucune formalité judiciaire :
- deux mois après un commandement de payer demeuré sans effet, pour défaut de paiement du loyer, des charges ou du dépôt de garantie ;
- un mois après un commandement demeuré sans effet, pour défaut d'assurance contre les risques locatifs ;
- pour troubles de voisinage constatés par une décision de justice passée en force de chose jugée.

Dans ces cas, le bailleur pourra faire expulser le locataire et tous occupants de son chef, des locaux loués, sur simple ordonnance de référé.`,
    },
    {
      numero: "14",
      titre: "Congé et fin de bail",
      texte: isMobilite
        ? `Le locataire peut donner congé à tout moment, moyennant un préavis d'un mois, par lettre recommandée avec avis de réception, par acte d'huissier ou remise contre récépissé. Le bailleur ne dispose d'aucun droit de résiliation anticipée.`
        : `Le locataire peut donner congé à tout moment, moyennant un préavis de trois mois, ramené à un mois dans les cas prévus par la loi (zone tendue, mutation, perte d'emploi, premier emploi, état de santé, RSA, AAH, attribution d'un logement social, violences conjugales).

Le bailleur ne peut donner congé qu'à l'échéance du bail, avec un préavis de six mois, pour l'un des motifs suivants : reprise pour habiter, vente du logement, motif légitime et sérieux. Le congé doit comporter, à peine de nullité, le motif allégué et, en cas de reprise ou de vente, les mentions impératives prévues par la loi.`,
    },
    {
      numero: "15",
      titre: "Solidarité et indivisibilité",
      texte: `En cas de pluralité de locataires (colocataires), ces derniers seront tenus solidairement et indivisiblement au paiement du loyer, des charges et de l'exécution de toutes les obligations du présent bail. La solidarité s'étend, en cas de décès d'un colocataire, à ses héritiers et représentants.

En cas de congé donné par un colocataire, sa solidarité prend fin six mois après la date d'effet du congé, sauf si un nouveau colocataire figure au bail dans ce délai.`,
    },
    {
      numero: "16",
      titre: "Honoraires de location",
      texte:
        i.honoraires && i.honoraires > 0
          ? `Les honoraires liés à la mise en location s'élèvent à ${fmtEUR(i.honoraires)} TTC, à la charge du locataire, dans la limite légale du plafond applicable à la zone du logement. Ils couvrent l'organisation des visites, la constitution du dossier, la rédaction du bail et la réalisation de l'état des lieux d'entrée.`
          : `Aucun honoraire de location n'est dû par le locataire. Le présent bail a été conclu directement entre les parties.`,
    },
    {
      numero: "17",
      titre: "Diagnostics et documents annexés",
      texte: `Sont annexés au présent bail et en font partie intégrante :
- le diagnostic de performance énergétique (DPE) ;
- le constat de risque d'exposition au plomb (CREP) si le logement a été construit avant 1949 ;
- l'état mentionnant la présence ou l'absence d'amiante (si applicable) ;
- l'état de l'installation intérieure d'électricité et de gaz, lorsque celle-ci a plus de 15 ans ;
- l'état des risques et pollutions (ERP) ;
- la notice d'information relative aux droits et obligations des parties ;
- l'extrait du règlement de copropriété portant sur la destination de l'immeuble, la jouissance et l'usage des parties privatives et communes (si copropriété) ;
- en cas de location meublée, l'inventaire et l'état détaillé du mobilier.`,
    },
    {
      numero: "18",
      titre: "Élection de domicile et juridiction compétente",
      texte: `Pour l'exécution du présent bail, les parties élisent domicile à l'adresse du logement loué pour le locataire, et à l'adresse indiquée à l'article 1 pour le bailleur.
Tout litige relatif au présent contrat sera, à défaut de règlement amiable, de la compétence exclusive du tribunal judiciaire dans le ressort duquel se situe le logement.`,
    },
  ];

  return articles;
}

/** Convertit les articles en texte brut (pour aperçu ou export TXT). */
export function articlesToText(articles: LeaseArticle[], header: string): string {
  return [
    header,
    "",
    ...articles.flatMap((a) => [
      `Article ${a.numero} — ${a.titre}`,
      a.texte,
      "",
    ]),
  ].join("\n");
}
