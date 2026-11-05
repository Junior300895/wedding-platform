"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
    done: ms === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#174f8a] to-[#0b2c4d] text-white shadow-[0_10px_20px_rgba(20,35,50,0.25)] sm:rounded-2xl">
      <span className="text-2xl font-medium tabular-nums leading-none sm:text-3xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-[0.55rem] uppercase tracking-[0.1em] text-[#a9c8e8] sm:mt-1.5 sm:text-[0.7rem]">
        {label}
      </span>
    </div>
  );
}

/**
 * Compte a rebours en quatre tuiles. Chiffres en chasse fixe (tabular-nums)
 * pour qu'ils ne tressautent pas a chaque seconde.
 */
export function Countdown({
  date,
  accent,
}: {
  date: string;
  accent: string;
}) {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const target = new Date(date);
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [date]);

  // Rien au premier rendu serveur : evite un decalage d'hydratation.
  // La hauteur est reservee pour que la page ne saute pas a l'arrivee des tuiles.
  if (!t) return <div className="h-[4.25rem] sm:h-[5.5rem]" aria-hidden="true" />;

  if (t.done) {
    return (
      <p className={`text-center font-serif text-2xl ${accent}`}>
        C&apos;est aujourd&apos;hui.
      </p>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Il reste ${t.days} jours, ${t.hours} heures et ${t.minutes} minutes`}
      className="mx-auto grid max-w-[19rem] grid-cols-4 gap-2 sm:max-w-[25rem] sm:gap-3"
    >
      <Tile value={t.days} label="Jours" />
      <Tile value={t.hours} label="Heures" />
      <Tile value={t.minutes} label="Min" />
      <Tile value={t.seconds} label="Sec" />
    </div>
  );
}
