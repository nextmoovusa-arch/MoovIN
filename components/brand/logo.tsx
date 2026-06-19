import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Logo MoovIN — reconstitution vectorielle.
 * - Les éléments « navy » utilisent currentColor (s'adaptent au thème :
 *   bleu nuit en clair, blanc cassé en sombre).
 * - L'accent bleu vif reste constant.
 */

const BRAND_BLUE = "#2563EB";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MoovIN"
    >
      {/* Tours (skyline) */}
      <rect x="10" y="18" width="6" height="22" rx="1.5" fill={BRAND_BLUE} />
      <rect x="18" y="10" width="6" height="30" rx="1.5" fill="currentColor" />
      <path d="M26 14 L32 18 V40 H26 Z" fill="currentColor" opacity="0.9" />
      {/* Swoosh / coche ascendante */}
      <path
        d="M8 34 C 16 30, 24 22, 40 10"
        stroke={BRAND_BLUE}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoWord({ className }: { className?: string }) {
  return (
    <span className={cn("text-xl font-extrabold tracking-tight", className)}>
      <span className="text-[currentColor]">MOOV</span>
      <span style={{ color: BRAND_BLUE }}>IN</span>
    </span>
  );
}

export function Logo({
  className,
  markClassName,
  wordClassName,
  showWord = true,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <LogoMark className={markClassName} />
      {showWord && <LogoWord className={wordClassName} />}
    </span>
  );
}
