"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "closed" | "opening" | "leaving" | "gone";

/** Duree de l'ouverture, puis du fondu : a garder alignees sur globals.css. */
const OPENING_MS = 1500;
const LEAVING_MS = 700;

/**
 * Porte d'entree de l'invitation : couvre la page jusqu'au geste de l'invite.
 * L'ecran est rendu cote serveur, pour que la page n'apparaisse jamais avant
 * lui ; sans JavaScript, le <noscript> le retire pour laisser la page lisible.
 */
export function EnvelopeGate({
  label,
  header,
  envelope,
  hint,
}: {
  label: string;
  header: React.ReactNode;
  envelope: React.ReactNode;
  hint: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);

  // La page ne defile pas tant que l'enveloppe la couvre.
  useEffect(() => {
    if (stage === "leaving" || stage === "gone") return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [stage]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  function open() {
    if (stage !== "closed") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const opening = reduced ? 0 : OPENING_MS;
    const leaving = reduced ? 0 : LEAVING_MS;
    setStage("opening");
    timers.current.push(
      window.setTimeout(() => setStage("leaving"), opening),
      window.setTimeout(() => setStage("gone"), opening + leaving),
    );
  }

  if (stage === "gone") return null;

  return (
    <div className="envelope-intro" data-stage={stage}>
      <noscript>
        <style>{`.envelope-intro{display:none}`}</style>
      </noscript>
      {header}
      <button
        type="button"
        onClick={open}
        aria-label={label}
        className="envelope-button"
      >
        {envelope}
      </button>
      {hint}
    </div>
  );
}
