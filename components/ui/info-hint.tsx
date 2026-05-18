"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type InfoHintProps = {
  /** Texte affiché dans l'info-bulle. Peut être enrichi avec JSX (sous-titres, listes...). */
  children: React.ReactNode;
  /** Texte du titre (gras) en haut de l'info-bulle. */
  title?: string;
  /** Côté d'apparition. */
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

/**
 * Icône "i" pédagogique avec info-bulle au survol (et focus clavier).
 * Explique aux utilisateurs le calcul / la lecture d'un graphique ou d'une donnée.
 */
export function InfoHint({ children, title, side = "top", className }: InfoHintProps) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={title ?? "Plus d'informations"}
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </TooltipContent>
    </Tooltip>
  );
}
