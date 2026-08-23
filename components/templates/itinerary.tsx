import type { PublicEvent, Theme } from "./types";
import { formatTimeFr, formatDayMonthFr, isSameDay } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  CEREMONY: "Ceremonie",
  RECEPTION: "Reception",
  OTHER: "Evenement",
};

function mapHref(ev: PublicEvent): string {
  if (ev.mapUrl) return ev.mapUrl;
  const query = [ev.venueName, ev.address].filter(Boolean).join(" ");
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

/**
 * Le deroule de la journee, pose sur un rail vertical.
 *
 * Le marqueur de chaque etape est l'heure reelle : un mariage se deplace
 * d'un lieu a l'autre et l'invite s'organise autour de cette sequence.
 * L'ordre porte donc une information, il n'est pas decoratif.
 */
export function Itinerary({
  events,
  weddingDate,
  theme,
}: {
  events: PublicEvent[];
  weddingDate: Date;
  theme: Theme;
}) {
  return (
    <ol className="mx-auto max-w-2xl">
      {events.map((ev, index) => {
        const isLast = index === events.length - 1;
        const offDay = ev.startsAt && !isSameDay(ev.startsAt, weddingDate);

        return (
          <li
            key={ev.id}
            className={`relative border-l pl-6 sm:pl-8 ${theme.line} ${
              isLast ? "border-transparent pb-0" : "pb-12"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ${theme.accentDot}`}
            />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-8">
              <div className="shrink-0 sm:w-24 sm:pt-0.5">
                {ev.startsAt ? (
                  <>
                    <time
                      dateTime={new Date(ev.startsAt).toISOString()}
                      className={`block font-sans text-xl tabular-nums tracking-wider ${theme.accent}`}
                    >
                      {formatTimeFr(ev.startsAt)}
                    </time>
                    {offDay && (
                      <span className={`mt-0.5 block text-xs ${theme.accentSoft}`}>
                        {formatDayMonthFr(ev.startsAt)}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    aria-hidden="true"
                    className={`block text-xl leading-7 ${theme.accentSoft}`}
                  >
                    &middot;
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={`text-[0.7rem] uppercase tracking-[0.2em] ${theme.accentSoft}`}
                >
                  {TYPE_LABELS[ev.type] ?? TYPE_LABELS.OTHER}
                </p>
                <h3 className="mt-1 font-serif text-2xl leading-snug">{ev.title}</h3>
                <p className="mt-2 font-medium">{ev.venueName}</p>
                {ev.address && (
                  <p className="mt-0.5 text-sm opacity-70">{ev.address}</p>
                )}
                {/* Action principale pour l'invite : cible tactile pleine
                    hauteur, un mariage se rejoint depuis un telephone. */}
                <a
                  href={mapHref(ev)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 text-sm font-medium ${theme.accent} ${theme.surface} ${theme.line} transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
                >
                  Ouvrir l&apos;itineraire
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
