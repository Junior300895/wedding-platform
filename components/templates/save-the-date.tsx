import type { PublicWedding } from "./types";
import { sans, script } from "./envelope-intro";

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

// Dakar est a UTC, comme les dates enregistrees : les methodes UTC donnent
// le jour local quel que soit le fuseau du serveur.
const dayKey = (d: Date) =>
  `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;

function Heart() {
  return (
    <svg
      viewBox="0 0 64 58"
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 h-[2.9rem] w-[2.9rem] -translate-x-1/2 -translate-y-1/2 sm:h-16 sm:w-16"
    >
      <path
        d="M32 54C14 41 4 31 4 18 4 9.5 10.5 4 18.5 4 24.5 4 29.5 7.5 32 12.5 34.5 7.5 39.5 4 45.5 4 53.5 4 60 9.5 60 18 60 31 50 41 32 54Z"
        fill="none"
        stroke="var(--fp-warm)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Month({ year, month, marked }: { year: number; month: number; marked: Set<string> }) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // lundi en premier
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const title = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(first);

  return (
    <div>
      <h3 className="text-center font-serif text-2xl uppercase tracking-[0.18em] text-[var(--fp-ink-2)] sm:text-3xl">
        {title}
      </h3>
      <div aria-hidden="true" className="mx-auto mt-8 grid max-w-md grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-2 text-[0.7rem] uppercase tracking-[0.1em] text-[var(--fp-gold)] sm:text-sm">
            {d}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length }, (_, i) => {
          const day = i + 1;
          const isMarked = marked.has(`${year}-${month}-${day}`);
          return (
            <span
              key={day}
              className={`relative flex h-10 items-center justify-center text-lg sm:h-11 sm:text-xl ${
                isMarked ? "font-semibold text-[var(--fp-warm)]" : ""
              }`}
            >
              {isMarked && <Heart />}
              <span className="relative">{day}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Calendrier "Dates a retenir" : le jour J et les jours de chaque etape du
 * programme sont entoures d'un coeur. Un mois par mois concerne.
 */
export function SaveTheDate({ wedding }: { wedding: PublicWedding }) {
  const dates = [
    new Date(wedding.weddingDate),
    ...wedding.events.flatMap((e) => (e.startsAt ? [new Date(e.startsAt)] : [])),
  ].sort((a, b) => a.getTime() - b.getTime());

  const marked = new Set(dates.map(dayKey));
  const months = [
    ...new Map(
      dates.map((d) => [
        `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
        { year: d.getUTCFullYear(), month: d.getUTCMonth() },
      ])
    ).values(),
  ];
  const spoken = [...new Map(dates.map((d) => [dayKey(d), d])).values()]
    .map((d) =>
      new Intl.DateTimeFormat("fr-FR", {
        timeZone: "UTC",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
    )
    .join(", ");

  return (
    <div className={sans.className}>
      <p className="text-center text-xs uppercase tracking-[0.28em] text-[var(--fp-gold)] sm:text-sm">
        Notez les dates
      </p>
      <h2 className={`${script.className} mt-3 text-center text-5xl text-[var(--fp-ink)] sm:text-7xl`}>
        Dates à retenir
      </h2>
      <p className="sr-only">{spoken}</p>
      <div className="mt-10 space-y-14">
        {months.map(({ year, month }) => (
          <Month key={`${year}-${month}`} year={year} month={month} marked={marked} />
        ))}
      </div>
    </div>
  );
}
