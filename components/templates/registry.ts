import type { Theme } from "./types";

/**
 * Registre des themes. Le meme objet Wedding peut etre rendu avec
 * n'importe lequel de ces designs sans modifier les donnees metier.
 *
 * Chaque theme declare son fond, sa surface et son filet. La mise en page
 * ne suppose jamais un fond clair : un theme sombre obtient le meme
 * contraste qu'un theme clair sans que le layout ait a le savoir.
 */
export const themes: Record<string, Theme> = {
  classic: {
    key: "classic",
    name: "Classic",
    bg: "bg-[#faf7f2]",
    text: "text-[#2b2723]",
    surface: "bg-white",
    line: "border-[#e8dfd0]",
    accent: "text-[#5f4f3e]",
    accentSoft: "text-[#7d6b57]",
    accentDot: "bg-[#5f4f3e]",
    fieldBorder: "border-[#e0d5c2]",
    field: "bg-[#faf7f2] text-[#2b2723] placeholder:text-[#b0a08d]",
    fieldError: "text-red-600",
    heroFont: "font-serif",
    heroBgClass: "bg-gradient-to-b from-[#f3ede3] to-[#faf7f2]",
    heroScrim: "bg-gradient-to-b from-[#faf7f2]/70 via-[#faf7f2]/85 to-[#faf7f2]",
    divider: "❦",
  },
  minimal: {
    key: "minimal",
    name: "Minimal",
    bg: "bg-white",
    text: "text-neutral-900",
    surface: "bg-neutral-50",
    line: "border-neutral-200",
    accent: "text-neutral-900",
    accentSoft: "text-[#6b6b6b]",
    accentDot: "bg-neutral-900",
    fieldBorder: "border-neutral-300",
    field: "bg-white text-neutral-900 placeholder:text-neutral-400",
    fieldError: "text-red-600",
    heroFont: "font-sans",
    heroBgClass: "bg-white",
    heroScrim: "bg-gradient-to-b from-white/70 via-white/85 to-white",
    divider: "—",
  },
  luxury: {
    key: "luxury",
    name: "Luxury",
    bg: "bg-[#0a0a0a]",
    text: "text-[#f2efe9]",
    surface: "bg-[#141210]",
    line: "border-[#d4af37]/25",
    accent: "text-[#d4af37]",
    accentSoft: "text-[#9a8c6a]",
    accentDot: "bg-[#d4af37]",
    fieldBorder: "border-[#d4af37]/30",
    field:
      "bg-[#1e1b17] text-[#f2efe9] placeholder:text-[#8a7d60] [color-scheme:dark]",
    fieldError: "text-red-400",
    heroFont: "font-serif",
    heroBgClass: "bg-gradient-to-b from-black to-[#0a0a0a]",
    heroScrim: "bg-gradient-to-b from-black/65 via-black/80 to-[#0a0a0a]",
    divider: "✦",
  },
  floral: {
    key: "floral",
    name: "Floral",
    bg: "bg-[#fef6f8]",
    text: "text-[#3b2a30]",
    surface: "bg-white",
    line: "border-[#f6dbe3]",
    accent: "text-[#c02466]",
    accentSoft: "text-[#9c5875]",
    accentDot: "bg-[#c02466]",
    fieldBorder: "border-[#f0cad6]",
    field: "bg-[#fef6f8] text-[#3b2a30] placeholder:text-[#c98aa6]",
    fieldError: "text-red-600",
    heroFont: "font-serif",
    heroBgClass: "bg-gradient-to-b from-brand-50 to-[#fef6f8]",
    heroScrim: "bg-gradient-to-b from-[#fef6f8]/70 via-[#fef6f8]/85 to-[#fef6f8]",
    divider: "✿",
  },
  tradition: {
    key: "tradition",
    name: "Tradition",
    bg: "bg-[#fbf3e9]",
    text: "text-[#4a2c1a]",
    surface: "bg-[#fffaf3]",
    line: "border-[#e8d3b8]",
    accent: "text-[#a0522d]",
    accentSoft: "text-[#8a6238]",
    accentDot: "bg-[#a0522d]",
    fieldBorder: "border-[#ddc4a2]",
    field: "bg-[#fbf3e9] text-[#4a2c1a] placeholder:text-[#b08d68]",
    fieldError: "text-red-600",
    heroFont: "font-serif",
    heroBgClass: "bg-gradient-to-b from-[#f2e0c9] to-[#fbf3e9]",
    heroScrim: "bg-gradient-to-b from-[#fbf3e9]/70 via-[#fbf3e9]/85 to-[#fbf3e9]",
    divider: "◆",
  },
  oriental: {
    key: "oriental",
    name: "Oriental",
    bg: "bg-[#f4f8f6]",
    text: "text-[#0f3d2e]",
    surface: "bg-white",
    line: "border-[#cde3d8]",
    accent: "text-[#0f6b4f]",
    accentSoft: "text-[#2f7860]",
    accentDot: "bg-[#0f6b4f]",
    fieldBorder: "border-[#bcd8cb]",
    field: "bg-[#f4f8f6] text-[#0f3d2e] placeholder:text-[#6ba38d]",
    fieldError: "text-red-600",
    heroFont: "font-serif",
    heroBgClass: "bg-gradient-to-b from-[#dcefe7] to-[#f4f8f6]",
    heroScrim: "bg-gradient-to-b from-[#f4f8f6]/70 via-[#f4f8f6]/85 to-[#f4f8f6]",
    divider: "❈",
  },
};

/** Classe du bouton d'accent par theme (fond plein). */
export const accentButton: Record<string, string> = {
  classic: "bg-[#5f4f3e] hover:bg-[#4c3f31] text-white",
  minimal: "bg-neutral-900 hover:bg-neutral-800 text-white",
  luxury: "bg-[#d4af37] hover:bg-[#c19b2c] text-neutral-900",
  floral: "bg-[#c02466] hover:bg-[#a01d55] text-white",
  tradition: "bg-[#a0522d] hover:bg-[#8b4513] text-white",
  oriental: "bg-[#0f6b4f] hover:bg-[#0d5a42] text-white",
};

export function getTheme(key: string): Theme {
  return themes[key] ?? themes.classic;
}

export function getAccentButton(key: string): string {
  return accentButton[key] ?? accentButton.classic;
}
