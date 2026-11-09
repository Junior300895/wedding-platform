"use client";

import { useEffect, useRef, useState } from "react";
import { INVITATION_OPEN_EVENT } from "./envelope-gate";

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
      {on ? (
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
      ) : (
        <path d="M17 9l5 6M22 9l-5 6" strokeLinecap="round" />
      )}
    </svg>
  );
}

/**
 * Video de couverture. Elle demarre muette et en boucle : c'est la condition
 * pour que les navigateurs acceptent la lecture automatique. Le bouton en
 * haut a droite active le son ; un clic de l'invite autorise alors l'audio.
 * Pour qui demande moins de mouvement, la video attend ce meme clic.
 */
export function HeroVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React n'ecrit pas toujours l'attribut muted au rendu serveur.
    video.muted = true;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.play().catch(() => undefined);
    }
  }, []);

  function setSound(on: boolean) {
    const video = ref.current;
    if (!video) return;
    video.muted = !on;
    if (on) {
      video.volume = 1;
      video.play().catch(() => {
        // Lecture refusee malgre le geste : on reste muet et le bouton le dit.
        video.muted = true;
        setSoundOn(false);
      });
    }
    setSoundOn(on);
  }

  // Le son demarre a l'ouverture de l'enveloppe : l'evenement est emis
  // pendant le clic de l'invite, ce qui autorise l'audio.
  useEffect(() => {
    const onOpen = () => setSound(true);
    window.addEventListener(INVITATION_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(INVITATION_OPEN_EVENT, onOpen);
  }, []);

  const toggleSound = () => setSound(!soundOn);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className={className}
      />
      {/* Fixe : le son se coupe depuis n'importe quel endroit de la page. */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Couper le son de la video" : "Activer le son de la video"}
        className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[color-mix(in_srgb,var(--fp-ink)_90%,transparent)] text-white shadow-lg transition-colors hover:bg-[var(--fp-ink-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <SoundIcon on={soundOn} />
      </button>
    </>
  );
}
