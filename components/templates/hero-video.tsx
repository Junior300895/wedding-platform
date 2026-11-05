"use client";

import { useEffect, useRef } from "react";

/**
 * Video de couverture : muette et en boucle, condition pour que les navigateurs
 * mobiles acceptent la lecture automatique. Pour qui demande moins de
 * mouvement, ou si la lecture est refusee, l'affiche reste a l'ecran.
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

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React n'ecrit pas toujours l'attribut muted au rendu serveur.
    video.muted = true;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.play().catch(() => undefined);
    }
  }, []);

  return (
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
  );
}
