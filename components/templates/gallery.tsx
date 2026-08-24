"use client";

import { useEffect, useState } from "react";
import type { PublicPhoto } from "./types";

export function Gallery({
  photos,
  coupleName,
}: {
  photos: PublicPhoto[];
  coupleName: string;
}) {
  const [active, setActive] = useState<{ url: string; index: number } | null>(
    null
  );

  // Echap ferme la visionneuse, et le fond ne defile plus derriere elle.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive({ url: p.url, index: i })}
            aria-label={`Agrandir la photo ${i + 1} sur ${photos.length}`}
            className="group relative aspect-square overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={`${coupleName} — photo ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={`${coupleName} — photo ${active.index + 1}`}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            autoFocus
            onClick={() => setActive(null)}
            aria-label="Fermer"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-3xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
