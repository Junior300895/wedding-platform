import { Great_Vibes, Montserrat } from "next/font/google";
import type { PublicWedding } from "./types";
import { EnvelopeFlowers } from "./envelope-flowers";
import { EnvelopeGate } from "./envelope-gate";

export const script = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap" });
export const sans = Montserrat({ subsets: ["latin"], display: "swap" });

// Les dates sont affichees a l'heure du lieu, quel que soit le serveur.
const TIME_ZONE = "Africa/Dakar";

/** Les pastilles restent sobres : les emojis des titres n'y figurent pas. */
function clean(text: string) {
  return text.replace(/[\p{Extended_Pictographic}️‍]/gu, "").trim();
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, ...options }).format(date);
}

/** Monogramme du sceau : initiale de chaque prenom. */
function initial(name: string) {
  return Array.from(name.trim())[0]?.toUpperCase() ?? "";
}

export function EnvelopeIntro({ wedding }: { wedding: PublicWedding }) {
  const date = new Date(wedding.weddingDate);
  const day = formatDate(date, { day: "numeric" });
  const monthYear = formatDate(date, { month: "long", year: "numeric" });

  // L'evenement mis en avant : la reception, sinon le premier qui a une heure.
  const event =
    wedding.events.find((e) => e.type === "RECEPTION") ??
    wedding.events.find((e) => e.startsAt) ??
    wedding.events[0];
  const eventDate = event?.startsAt ? new Date(event.startsAt) : date;
  const time = event?.startsAt
    ? formatDate(eventDate, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).replace(":", "h")
    : wedding.weddingTime?.replace(":", "h");
  const shortDate = formatDate(eventDate, { day: "numeric", month: "short" });

  const couple = `${wedding.partnerOne} & ${wedding.partnerTwo}`;

  return (
    <EnvelopeGate
      label={`Ouvrir l'invitation de ${couple}`}
      header={
        <header className={`envelope-header ${sans.className}`}>
          {event && (
            <div className="envelope-pills">
              <span className="envelope-pill envelope-pill-warm">
                {[clean(event.title), time].filter(Boolean).join(" · ")}
              </span>
              <span className="envelope-pill envelope-pill-blue">
                {clean(event.venueName)} · {shortDate}
              </span>
            </div>
          )}
          <p className="envelope-eyebrow">Invitation</p>
          <p className="envelope-ornament" aria-hidden="true">
            – ✦ –
          </p>
          <h1 className={`envelope-names ${script.className}`}>
            {wedding.partnerOne} <span>&amp;</span> {wedding.partnerTwo}
          </h1>
          <p className="envelope-date">
            Le <strong>{day}</strong> {monthYear}
          </p>
        </header>
      }
      envelope={
        <span className="envelope-scene">
          <span className="envelope-body">
            <span className="envelope-card" />
            <span className="envelope-pocket envelope-pocket-left" />
            <span className="envelope-pocket envelope-pocket-right" />
            <span className="envelope-pocket envelope-pocket-bottom" />
            <span className="envelope-flap" />
            <span className={`envelope-seal ${script.className}`}>
              {initial(wedding.partnerOne)}&amp;{initial(wedding.partnerTwo)}
            </span>
          </span>
          <EnvelopeFlowers id="envelope-top" className="envelope-flowers envelope-flowers-top" />
          <EnvelopeFlowers id="envelope-bottom" className="envelope-flowers envelope-flowers-bottom" />
        </span>
      }
      hint={<p className={`envelope-hint ${sans.className}`}>Touchez l&apos;enveloppe pour l&apos;ouvrir</p>}
    />
  );
}
