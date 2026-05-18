"use client";

import * as React from "react";
import { CardTitle } from "@/components/ui/card";
import { InfoHint } from "@/components/ui/info-hint";

/**
 * Petit wrapper qui affiche un CardTitle + une icône "i" d'info-bulle à droite.
 * Permet d'expliquer rapidement le sens / le calcul d'un graphique.
 */
export function CardTitleInfo({
  title,
  hint,
}: {
  title: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <CardTitle>{title}</CardTitle>
      <InfoHint title={title}>{hint}</InfoHint>
    </div>
  );
}
