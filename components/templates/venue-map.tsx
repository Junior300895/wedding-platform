import type { PublicEvent } from "./types";
import { sans } from "./envelope-intro";

/** Hotes des liens courts Google Maps : seuls ceux-ci sont suivis par le serveur. */
const SHORT_LINK_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.co"];

/** Cherche des coordonnees dans une URL Google Maps ; la position exacte d'abord. */
function coordinatesFromUrl(url: string): string | null {
  let text = url;
  try {
    text = decodeURIComponent(url);
  } catch {
    // URL mal encodee : on la lit telle quelle.
  }
  const match =
    text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ??
    text.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/) ??
    text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return match ? `${match[1]},${match[2]}` : null;
}

/** Un lien court ne dit rien du lieu : sa redirection donne l'URL complete. */
async function expandShortLink(url: string): Promise<string> {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" || !SHORT_LINK_HOSTS.includes(hostname)) return url;
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    return response.headers.get("location") ?? url;
  } catch {
    return url;
  }
}

/** Ce que la carte doit pointer, ou null si rien ne permet de placer le lieu. */
async function mapQuery(event: PublicEvent): Promise<string | null> {
  if (event.latitude != null && event.longitude != null) {
    return `${event.latitude},${event.longitude}`;
  }
  const mapUrl = event.mapUrl?.trim();
  if (mapUrl) {
    const coordinates = coordinatesFromUrl(await expandShortLink(mapUrl));
    if (coordinates) return coordinates;
  }
  const address = event.address?.trim();
  return address
    ? [event.venueName?.trim(), address].filter(Boolean).join(" ")
    : null;
}

/** Les titres peuvent contenir des emojis, deplaces sur cette ligne elegante. */
function clean(text: string) {
  return text.replace(/[\p{Extended_Pictographic}️‍]/gu, "").trim();
}

export async function VenueMap({
  event,
  href,
  weddingDate,
}: {
  event: PublicEvent;
  href: string;
  weddingDate: Date;
}) {
  const query = await mapQuery(event);
  const day = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Dakar",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(event.startsAt ?? weddingDate));
  const details = [day, clean(event.venueName), event.address && clean(event.address)]
    .filter(Boolean)
    .join(" · ");
  const title = clean(event.title);

  return (
    <article className="text-center">
      <h3 className="font-serif text-3xl sm:text-4xl">{title}</h3>
      <p
        className={`${sans.className} mt-2 text-xs uppercase tracking-[0.1em] text-[#174f8a] sm:text-sm`}
      >
        {details}
      </p>

      <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_18px_45px_rgba(70,50,20,0.14)]">
        {query && (
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=fr&output=embed`}
            title={`Carte : ${clean(event.venueName)}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[220px] w-full border-0 sm:h-[280px]"
          />
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${sans.className} flex min-h-[48px] items-center justify-center bg-[#0f2d4e] px-5 text-center text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#174f8a] sm:text-sm`}
        >
          Ouvrir dans Google Maps
        </a>
      </div>
    </article>
  );
}
