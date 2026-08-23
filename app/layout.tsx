import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Fraunces plutot qu'un serif de mariage attendu : son axe optique donne
 * aux prenoms en tres grand une coupe differente de celle des titres de
 * section, ce qu'une graisse statique ne permet pas.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Faire-part Digital - Invitations de mariage en ligne",
    template: "%s | Faire-part Digital",
  },
  description:
    "Creez une invitation de mariage digitale, elegante et partageable par lien. Templates premium, RSVP, galerie photo et QR code.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
