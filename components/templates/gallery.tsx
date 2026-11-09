"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicPhoto } from "./types";

/** Distance horizontale minimale (px) pour qu'un glissement change de photo. */
const SWIPE_THRESHOLD = 50;
/** Temps de pose de chaque photo quand la galerie defile seule. */
const AUTOPLAY_MS = 2500;
/** Premier changement, des que la galerie arrive a l'ecran. */
const FIRST_AUTOPLAY_MS = 1000;

/**
 * Tirage de la pile : une largeur de 900 px suffit a cette taille d'affichage.
 * La visionneuse garde la grande image ; une URL locale reste inchangee.
 */
function stackSrc(url: string) {
  return url.includes("res.cloudinary.com") ? url.replace("w_2000", "w_900") : url;
}

/** Pose des photos dans la pile : celle du dessus, puis les deux suivantes. */
const STACK_POSES = [
  "z-30 [transform:rotate(-1.5deg)]",
  "z-20 [transform:translate(3%,3%)_rotate(2deg)_scale(0.97)]",
  "z-10 [transform:translate(-3%,4%)_rotate(-3.5deg)_scale(0.95)]",
];

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current stroke-2"
    >
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function Gallery({
  photos,
  coupleName,
}: {
  photos: PublicPhoto[];
  coupleName: string;
}) {
  // Index de la photo ouverte dans la visionneuse, null si fermee.
  const [index, setIndex] = useState<number | null>(null);
  // Photo sur le dessus de la pile.
  const [active, setActive] = useState(0);
  // Photo en train de quitter la pile, et photo en train d'y revenir.
  const [leaving, setLeaving] = useState<PublicPhoto | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  // Le defilement automatique attend que la galerie soit a l'ecran et s'arrete
  // tant que le clavier est sur elle. Le survol ne l'arrete pas : la pile occupe
  // le centre de l'ecran, la souris s'y trouve le plus souvent sans le vouloir.
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const hasAdvanced = useRef(false);
  const stackRef = useRef<HTMLDivElement>(null);
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

  // En quittant la visionneuse, la pile est restee sur la derniere photo vue.
  useEffect(() => {
    if (index !== null) setActive(index);
  }, [index]);

  // Precharge les photos voisines : le passage a la suivante est immediat.
  useEffect(() => {
    if (count < 2) return;
    if (index !== null) {
      for (const i of [(index + 1) % count, (index - 1 + count) % count]) {
        new Image().src = photos[i].url;
      }
      return;
    }
    // Pile : la photo qui va entrer et celle d'avant sont pretes a l'avance.
    for (const i of [(active + 3) % count, (active - 1 + count) % count]) {
      new Image().src = stackSrc(photos[i].url);
    }
  }, [index, active, count, photos]);

  const stackNext = useCallback(() => {
    if (count < 2) return;
    setEnteringId(null);
    setLeaving(photos[active]);
    setActive((active + 1) % count);
  }, [active, count, photos]);

  const stackPrev = useCallback(() => {
    if (count < 2) return;
    const target = (active - 1 + count) % count;
    setLeaving(null);
    setEnteringId(photos[target].id);
    setActive(target);
  }, [active, count, photos]);

  useEffect(() => {
    const element = stackRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Le minuteur repart a chaque changement : une photo choisie a la main
  // garde tout son temps de pose.
  useEffect(() => {
    if (count < 2 || !inView || paused || open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => {
        hasAdvanced.current = true;
        stackNext();
      },
      hasAdvanced.current ? AUTOPLAY_MS : FIRST_AUTOPLAY_MS
    );
    return () => window.clearTimeout(timer);
  }, [active, count, inView, paused, open, stackNext]);

  if (count === 0) return null;

  const current = index !== null ? photos[index] : null;
  // Les photos visibles, du dessus vers le dessous.
  const stack = Array.from({ length: Math.min(count, STACK_POSES.length) }, (_, depth) => ({
    photo: photos[(active + depth) % count],
    position: (active + depth) % count,
    depth,
  }));

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleSwipe(e: React.TouchEvent, onNext: () => void, onPrev: () => void) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Geste surtout horizontal et assez long : on change de photo.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      justSwiped.current = true;
      if (dx < 0) onNext();
      else onPrev();
    }
  }

  const stackButton =
    "absolute top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--fp-ink)_20%,transparent)] bg-white/70 text-[var(--fp-ink)] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fp-ink)] sm:h-14 sm:w-14";

  const navButton =
    "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <>
      {/* La pile de tirages : le geste, les fleches et le clic agissent tous
          sur la photo du dessus. */}
      <div
        className="relative mx-auto w-fit px-2 sm:px-20"
        // Focus clavier seulement : un bouton touche ou clique garde le focus,
        // ce qui arreterait le defilement pour de bon.
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setPaused(true);
        }}
        onBlur={() => setPaused(false)}
      >
        <div
          ref={stackRef}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => handleSwipe(e, stackNext, stackPrev)}
          className="relative aspect-[3/4] w-[min(70vw,56vh,480px)] touch-pan-y"
        >
          {stack.map(({ photo, position, depth }) => (
            <button
              key={photo.id}
              type="button"
              onAnimationEnd={() => setEnteringId(null)}
              tabIndex={depth === 0 ? 0 : -1}
              aria-hidden={depth === 0 ? undefined : true}
              aria-label={`Agrandir la photo ${position + 1} sur ${count}`}
              onClick={() => {
                if (justSwiped.current) {
                  justSwiped.current = false;
                  return;
                }
                if (depth === 0) setIndex(position);
              }}
              className={`absolute inset-0 rounded-lg bg-[#fbf8f1] p-2 shadow-[0_14px_35px_rgba(50,35,10,0.22)] transition-transform duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fp-ink)] sm:p-3 ${STACK_POSES[depth]} ${
                depth === 0 ? "cursor-zoom-in" : "pointer-events-none"
              } ${depth === 0 && enteringId === photo.id ? "gallery-enter" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stackSrc(photo.url)}
                alt={depth === 0 ? `${coupleName} — photo ${position + 1}` : ""}
                decoding="sync"
                draggable={false}
                className="h-full w-full select-none rounded object-cover"
              />
            </button>
          ))}

          {leaving && (
            <div
              key={`leaving-${leaving.id}`}
              aria-hidden="true"
              onAnimationEnd={() => setLeaving(null)}
              className="gallery-leave pointer-events-none absolute inset-0 z-[35] rounded-lg bg-[#fbf8f1] p-2 shadow-[0_14px_35px_rgba(50,35,10,0.22)] sm:p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stackSrc(leaving.url)}
                alt=""
                draggable={false}
                className="h-full w-full select-none rounded object-cover"
              />
            </div>
          )}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={stackPrev}
              aria-label="Photo precedente"
              className={`${stackButton} -left-1 sm:left-0`}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={stackNext}
              aria-label="Photo suivante"
              className={`${stackButton} -right-1 sm:right-0`}
            >
              <Chevron direction="right" />
            </button>
            <p aria-live="polite" className="sr-only">
              Photo {active + 1} sur {count}
            </p>
          </>
        )}
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
          onTouchEnd={(e) => handleSwipe(e, next, prev)}
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
