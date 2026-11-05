"use client";

import { useEffect, useState } from "react";

/**
 * Menu flottant de l'invitation. La rubrique active est celle qui traverse le
 * milieu de l'ecran ; entre deux rubriques, la precedente reste allumee.
 */
export function SectionNav({
  items,
  className = "",
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    items.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    // Le pied de page est trop court pour atteindre le milieu de l'ecran :
    // tout en bas de la page, c'est la derniere rubrique qui s'allume.
    const onScroll = () => {
      const root = document.documentElement;
      if (window.scrollY < 4) {
        setActive(items[0]?.id);
      } else if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) {
        setActive(items[items.length - 1]?.id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav
      aria-label="Rubriques de l'invitation"
      className={`fixed bottom-3 left-1/2 z-40 max-w-[calc(100vw-1rem)] -translate-x-1/2 overflow-x-auto rounded-full border border-white/20 bg-[#0f2d4e]/95 px-2 shadow-lg sm:px-6 no-scrollbar ${className}`}
    >
      <ul className="flex items-center">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              onClick={() => setActive(id)}
              className={`flex min-h-[44px] items-center whitespace-nowrap px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.06em] transition-colors sm:px-3 sm:text-sm ${
                active === id ? "text-[#d8b978]" : "text-white hover:text-[#d8b978]"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
