import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Genere un slug URL-safe a partir de deux prenoms. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enleve les accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildWeddingSlug(partnerOne: string, partnerTwo: string): string {
  return slugify(`${partnerOne}-${partnerTwo}`);
}

export function formatDateFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Heure seule, ex "16:00". */
export function formatTimeFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Jour et mois sans l'annee, ex "31 aout" (pour un mariage sur plusieurs jours). */
export function formatDayMonthFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(d);
}

/** Vrai si les deux dates tombent le meme jour civil. */
export function isSameDay(a: Date | string, b: Date | string): boolean {
  const d1 = typeof a === "string" ? new Date(a) : a;
  const d2 = typeof b === "string" ? new Date(b) : b;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatPrice(amount: number, currency = "XOF"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const isLocalhost = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);

/**
 * Adresse publique de l'application, calculee a chaque appel (cote serveur).
 *
 * Ordre de priorite :
 *   1. NEXT_PUBLIC_APP_URL, sauf si elle pointe vers localhost alors qu'on
 *      tourne sur Vercel (cas typique : .env.local colle tel quel dans Vercel)
 *   2. Sur Vercel en production : le domaine de production du projet
 *   3. Sur Vercel en preview : l'URL du deploiement
 *   4. En local : http://localhost:3000
 *
 * Les variables VERCEL_* sont fournies par Vercel a l'execution : pas besoin
 * de redeployer pour qu'elles soient prises en compte, contrairement a une
 * variable NEXT_PUBLIC_ inscrite dans le code au moment du build.
 */
export function appUrl(): string {
  const onVercel = Boolean(process.env.VERCEL);
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");

  if (explicit && !(onVercel && isLocalhost(explicit))) return explicit;

  if (onVercel) {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (process.env.VERCEL_ENV === "production" && production) {
      return `https://${production}`;
    }
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${appUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
