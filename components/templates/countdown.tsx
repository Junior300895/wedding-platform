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

/**
 * Compte a rebours volontairement discret : l'invite vient chercher un lieu
 * et une heure, pas un chronometre. Chiffres en chasse fixe (tabular-nums)
 * pour que la ligne ne tressaute pas a chaque seconde.
 */
export function Countdown({
  date,
  accent,
  accentSoft,
}: {
  date: string;
  accent: string;
  accentSoft: string;
}) {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const target = new Date(date);
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [date]);

  // Rien au premier rendu serveur : evite un decalage d'hydratation.
  if (!t) return <div className="h-16" aria-hidden="true" />;

  if (t.done) {
    return (
      <p className={`text-center font-serif text-2xl ${accent}`}>
        C&apos;est aujourd&apos;hui.
      </p>
    );
  }

  return (
    <p className="text-center">
      <span className={`text-xs uppercase tracking-[0.25em] ${accentSoft}`}>
        Plus que
      </span>
      <span className="mt-2 block font-serif text-3xl">
        {t.days > 0
          ? `${t.days} ${t.days > 1 ? "jours" : "jour"}`
          : "quelques heures"}
      </span>
      <span
        className="mt-1 block font-sans text-sm tabular-nums tracking-widest opacity-55"
        aria-hidden="true"
      >
        {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
      </span>
    </p>
  );
}
