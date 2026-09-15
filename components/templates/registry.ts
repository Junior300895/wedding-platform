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
    heroScrim: "bg-gradient-to-b from-[#faf7f2]/10 via-[#faf7f2]/25 to-[#faf7f2]",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(250,247,242,0.72)_0%,rgba(250,247,242,0.42)_45%,rgba(250,247,242,0)_78%)]",
    divider: "❦",
    confetti: ["#5f4f3e", "#7d6b57", "#c9a24b", "#d8c7b0", "#e0d5c2"],
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
    heroScrim: "bg-gradient-to-b from-white/10 via-white/25 to-white",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.42)_45%,rgba(255,255,255,0)_78%)]",
    divider: "—",
    confetti: ["#a3a3a3", "#c4c4c4", "#d4d4d4", "#8a8a8a", "#e5e5e5"],
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
    heroScrim: "bg-gradient-to-b from-black/15 via-black/30 to-[#0a0a0a]",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.42)_45%,rgba(10,10,10,0)_78%)]",
    divider: "✦",
    confetti: ["#d4af37", "#e3c98a", "#9a8c6a", "#b3a582", "#7a6b46"],
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
    heroScrim: "bg-gradient-to-b from-[#fef6f8]/10 via-[#fef6f8]/25 to-[#fef6f8]",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(254,246,248,0.72)_0%,rgba(254,246,248,0.42)_45%,rgba(254,246,248,0)_78%)]",
    divider: "✿",
    confetti: ["#c02466", "#e06b96", "#f2a8c4", "#9c5875", "#f6dbe3"],
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
    heroScrim: "bg-gradient-to-b from-[#fbf3e9]/10 via-[#fbf3e9]/25 to-[#fbf3e9]",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(251,243,233,0.72)_0%,rgba(251,243,233,0.42)_45%,rgba(251,243,233,0)_78%)]",
    divider: "◆",
    confetti: ["#a0522d", "#c9a24b", "#ddc4a2", "#8a6238", "#e8d3b8"],
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
    heroScrim: "bg-gradient-to-b from-[#f4f8f6]/10 via-[#f4f8f6]/25 to-[#f4f8f6]",
    heroTextScrim:
      "bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(244,248,246,0.72)_0%,rgba(244,248,246,0.42)_45%,rgba(244,248,246,0)_78%)]",
    divider: "❈",
    confetti: ["#0f6b4f", "#3a8a70", "#8fc4ae", "#2f7860", "#cde3d8"],
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
