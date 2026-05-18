import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MoovIN — Cockpit financier & locatif des investisseurs immobiliers",
  description:
    "Plateforme all-in-one de pilotage immobilier : dashboard, simulateurs, fiscalité, conformité, espace locataire. Mode clair / sombre.",
  applicationName: "MoovIN",
  authors: [{ name: "MoovIN" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
};

// Anti-FOUC : applique le thème avant tout rendu (Module 14.7.3)
const themeScript = `
(function(){try{
  var s = localStorage.getItem('theme');
  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var t = (s === 'dark' || s === 'light') ? s : sys;
  document.documentElement.classList.add(t);
  document.documentElement.style.colorScheme = t;
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
