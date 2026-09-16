"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicPhoto } from "./types";

/** Distance horizontale minimale (px) pour qu'un glissement change de photo. */
const SWIPE_THRESHOLD = 50;

export function Gallery({
  photos,
  coupleName,
}: {
  photos: PublicPhoto[];
  coupleName: string;
}) {
  // Index de la photo ouverte dans la visionneuse, null si fermee.
  const [index, setIndex] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Un glissement se termine par un clic synthetique sur mobile : sans ce
  // drapeau, ce clic tomberait sur le fond et fermerait la visionneuse.
  const justSwiped = useRef(false);

  const count = photos.length;
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count]
  );

  // Clavier (Echap, fleches) et blocage du defilement de la page derriere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, prev, next]);

  // Precharge les photos voisines : le passage a la suivante est immediat.
  useEffect(() => {
    if (index === null || count < 2) return;
    for (const i of [(index + 1) % count, (index - 1 + count) % count]) {
      const img = new Image();
      img.src = photos[i].url;
    }
  }, [index, count, photos]);

  if (count === 0) return null;

  const current = index !== null ? photos[index] : null;

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Geste surtout horizontal et assez long : on change de photo.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      justSwiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  }

  const navButton =
    "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Agrandir la photo ${i + 1} sur ${count}`}
            className="group relative aspect-square overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbnailUrl ?? p.url}
              alt={`${coupleName} — photo ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${index + 1} sur ${count}`}
          onClick={() => {
            if (justSwiped.current) {
              justSwiped.current = false;
              return;
            }
            close();
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-50 flex touch-pan-y items-center justify-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.url}
            alt={`${coupleName} — photo ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full select-none rounded-xl object-contain"
            draggable={false}
          />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Photo precedente"
                className={`${navButton} left-3 sm:left-6`}
              >
                <span aria-hidden="true">&lsaquo;</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Photo suivante"
                className={`${navButton} right-3 sm:right-6`}
              >
                <span aria-hidden="true">&rsaquo;</span>
              </button>

              <p
                aria-live="polite"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm tabular-nums text-white/90"
              >
                {index + 1} / {count}
              </p>
            </>
          )}

          <button
            type="button"
            autoFocus
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-3xl text-white/90 transition-colors hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
