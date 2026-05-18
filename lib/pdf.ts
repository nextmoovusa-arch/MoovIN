"use client";

import { jsPDF } from "jspdf";

/* -------- Utilitaires bas niveau -------- */

type PdfBlock =
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "article"; numero: string; titre: string; texte: string }
  | { kind: "paragraph"; text: string }
  | { kind: "spacer"; height?: number }
  | { kind: "signatures"; bailleur: string; locataire: string };

const MARGIN_X = 50;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 50;
const LINE_HEIGHT = 14;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return y;
}

function drawWrapped(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(line, x, y);
    y += LINE_HEIGHT;
  }
  return y;
}

/* -------- API publique -------- */

export type PdfDoc = {
  filename: string;
  blocks: PdfBlock[];
  /** Petite mention en pied de page (n° page, date, app). */
  footerLabel?: string;
};

export function downloadPdf(doc: PdfDoc) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN_X * 2;
  let y = MARGIN_TOP;

  for (const block of doc.blocks) {
    switch (block.kind) {
      case "title":
        y = ensureSpace(pdf, y, 32);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(block.text, pageWidth / 2, y, { align: "center" });
        y += 24;
        break;
      case "subtitle":
        y = ensureSpace(pdf, y, 24);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(block.text, pageWidth / 2, y, { align: "center" });
        y += 22;
        break;
      case "article":
        y = ensureSpace(pdf, y, 24);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(`Article ${block.numero} — ${block.titre}`, MARGIN_X, y);
        y += LINE_HEIGHT + 2;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        y = drawWrapped(pdf, block.texte, MARGIN_X, y, contentWidth);
        y += 6;
        break;
      case "paragraph":
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        y = drawWrapped(pdf, block.text, MARGIN_X, y, contentWidth);
        y += 4;
        break;
      case "spacer":
        y += block.height ?? 8;
        break;
      case "signatures":
        y = ensureSpace(pdf, y, 80);
        y += 16;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text("Fait à ____________________, le ____________________", MARGIN_X, y);
        y += LINE_HEIGHT;
        pdf.text("En deux exemplaires originaux.", MARGIN_X, y);
        y += 24;
        const colW = contentWidth / 2;
        pdf.setFont("helvetica", "bold");
        pdf.text("Le bailleur", MARGIN_X, y);
        pdf.text("Le locataire", MARGIN_X + colW, y);
        y += LINE_HEIGHT;
        pdf.setFont("helvetica", "normal");
        pdf.text(block.bailleur || "(nom et signature)", MARGIN_X, y);
        pdf.text(block.locataire || "(nom et signature)", MARGIN_X + colW, y);
        y += LINE_HEIGHT;
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text("(précédé de la mention « lu et approuvé »)", MARGIN_X, y);
        pdf.text("(précédé de la mention « lu et approuvé »)", MARGIN_X + colW, y);
        pdf.setTextColor(0);
        pdf.setFontSize(10);
        y += LINE_HEIGHT;
        break;
    }
  }

  // Pied de page sur chaque page
  const pageCount = pdf.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(140);
    const footer = `${doc.footerLabel ?? "MoovIN"} — ${new Date().toLocaleDateString("fr-FR")} — Page ${p} / ${pageCount}`;
    pdf.text(footer, pageWidth / 2, pdf.internal.pageSize.getHeight() - 24, { align: "center" });
    pdf.setTextColor(0);
  }

  pdf.save(doc.filename);
}

/* -------- Helpers de haut niveau -------- */

export function downloadQuittancePDF(opts: {
  mois: string;
  bailleurNom: string;
  bailleurAdresse: string;
  locataireNom: string;
  bienAdresse: string;
  loyer: number;
  charges: number;
}) {
  const total = opts.loyer + opts.charges;
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
  downloadPdf({
    filename: `Quittance-${opts.mois.replace(/\s+/g, "_")}.pdf`,
    footerLabel: "MoovIN · Quittance de loyer",
    blocks: [
      { kind: "title", text: "QUITTANCE DE LOYER" },
      { kind: "subtitle", text: `Période : ${opts.mois}` },
      { kind: "spacer", height: 12 },
      {
        kind: "paragraph",
        text: `Je soussigné(e) ${opts.bailleurNom || "[nom du bailleur]"}, demeurant ${opts.bailleurAdresse || "[adresse]"}, propriétaire du logement situé ${opts.bienAdresse}, donne quittance à ${opts.locataireNom} de la somme suivante :`,
      },
      { kind: "spacer" },
      { kind: "article", numero: "1", titre: "Détail du règlement", texte: `Loyer (hors charges) : ${fmt(opts.loyer)}\nProvision sur charges : ${fmt(opts.charges)}\nTotal versé : ${fmt(total)}` },
      {
        kind: "paragraph",
        text: "Cette quittance annule toutes les éventuelles quittances qui auraient pu être établies précédemment en cas de paiement partiel. Elle est délivrée sous réserve de tous mes droits.",
      },
      { kind: "signatures", bailleur: opts.bailleurNom, locataire: "" },
    ],
  });
}
