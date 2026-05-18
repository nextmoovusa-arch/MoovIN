import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatEUR = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    ...opts,
  }).format(n);

export const formatPct = (n: number, digits = 1) =>
  `${n.toFixed(digits).replace(".", ",")} %`;

export const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
