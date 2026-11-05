import type { PublicWedding, Theme } from "./types";
import { getTheme, getAccentButton } from "./registry";
import { Confetti } from "./confetti";
import { Countdown } from "./countdown";
import { EnvelopeIntro, sans, script } from "./envelope-intro";
import { SectionNav } from "./section-nav";
import { VenueMap } from "./venue-map";
import { Itinerary, mapHref } from "./itinerary";
import { Gallery } from "./gallery";
import { RsvpForm } from "./rsvp-form";
import { ShareButtons } from "./share-buttons";
import { HeroVideo } from "./hero-video";
import { isVideo } from "@/lib/media";
import { formatDateFr } from "@/lib/utils";

/**
 * Entete de section : eyebrow, titre, filet court.
 * Un seul dispositif, repete a l'identique, pour que la hierarchie vienne
 * du contenu et non de l'ornement.
 */
function SectionHead({
  eyebrow,
  title,
  theme,
}: {
  eyebrow: string;
  title: string;
  theme: Theme;
}) {
  return (
    <header className="mb-12 text-center">
      <p className={`text-[0.7rem] uppercase tracking-[0.28em] ${theme.accentSoft}`}>
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl">{title}</h2>
      <div className={`mx-auto mt-5 h-px w-10 ${theme.accentDot}`} />
    </header>
  );
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-5 py-20 sm:py-28 ${className}`}>{children}</section>
  );
}

export function WeddingTemplate({
  wedding,
  publicUrl,
  qrDataUrl,
}: {
  wedding: PublicWedding;
  publicUrl: string;
  qrDataUrl: string;
}) {
  const theme = getTheme(wedding.templateKey);
  const accentBtn = getAccentButton(wedding.templateKey);
  const images = wedding.photos.filter((p) => !isVideo(p.mimeType));
  const coverMedia = wedding.photos.find((p) => p.isCover);
  const coverVideo = isVideo(coverMedia?.mimeType) ? coverMedia : null;
  const cover = coverVideo
    ? null
    : (coverMedia?.url ?? images[0]?.url ?? wedding.coverImageUrl ?? null);
  const galleryPhotos = images.filter((p) => p.url !== cover);

  // Un lieu par itineraire : seuls ceux ou l'on peut se rendre sont listes.
  const venues = wedding.events.flatMap((event) => {
    const href = mapHref(event);
    return href ? [{ event, href }] : [];
  }).filter((v, i, all) => all.findIndex((o) => o.href === v.href) === i);

  // Le menu suit l'ordre de la page et ne propose que ce qui existe.
  const navItems = [
    wedding.message && { id: "histoire", label: "Histoire" },
    wedding.events.length > 0 && { id: "programme", label: "Programme" },
    venues.length > 0 && { id: "lieux", label: "Lieux" },
    galleryPhotos.length > 0 && { id: "galerie", label: "Galerie" },
    { id: "merci", label: "Merci" },
  ].filter((item): item is { id: string; label: string } => !!item);

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen`}>
      <EnvelopeIntro wedding={wedding} />
      <SectionNav items={navItems} className={sans.className} />

      {/* Confettis : couche fixe au-dessus de la page, inerte au clic et
          masquee pour qui a demande moins de mouvement. */}
      <Confetti colors={theme.confetti} />

      {/* ---------------------------------------------------------------
          HERO — la photo porte l'ouverture, le voile garde le titre lisible
      --------------------------------------------------------------- */}
      <section
        className={`relative flex min-h-[100svh] flex-col items-center overflow-hidden px-5 text-center ${
          coverVideo
            ? "justify-end bg-[#0b1d2c] pb-24 pt-24 text-white"
            : `justify-center py-24 ${theme.heroBgClass}`
        }`}
      >
        {coverVideo ? (
          <>
            <HeroVideo
              src={coverVideo.url}
              poster={coverVideo.thumbnailUrl}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* La video reste nette : seul le bas s'assombrit, sous le texte. */}
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0b1d2c]/85 via-[#0b1d2c]/40 to-transparent" />
          </>
        ) : (
          cover && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Voile leger : teinte la photo et la fond dans la page. */}
              <div className={`absolute inset-0 ${theme.heroScrim}`} />
              {/* Halo local : ne protege que la zone du titre, pour que la
                  photo reste visible tout autour. */}
              <div className={`absolute inset-0 ${theme.heroTextScrim}`} />
            </>
          )
        )}

        <div
          className={`relative animate-fade-in-up ${
            coverVideo ? "[text-shadow:0_2px_12px_rgba(0,0,0,0.45)]" : ""
          }`}
        >
          <p
            className={`text-[0.7rem] uppercase tracking-[0.35em] ${
              coverVideo ? "text-white/90" : theme.accentSoft
            }`}
          >
            {/* Nous nous marions */}
            2A DECO PROGRAMME
          </p>

          {coverVideo ? (
            <h1 className={`${script.className} mt-3 text-5xl leading-tight sm:text-7xl lg:text-8xl`}>
              {wedding.partnerOne} <span className="text-[#e08a5c]">&amp;</span>{" "}
              {wedding.partnerTwo}
            </h1>
          ) : (
            <h1
              className={`${theme.heroFont} mt-7 text-6xl leading-[0.95] sm:text-8xl`}
            >
              <span className="block">{wedding.partnerOne}</span>
              <span className={`my-2 block text-3xl sm:text-4xl ${theme.accent}`}>
                &amp;
              </span>
              <span className="block">{wedding.partnerTwo}</span>
            </h1>
          )}

          <p
            className={`font-sans text-sm uppercase tracking-[0.2em] sm:text-base ${
              coverVideo ? "mt-4" : "mt-9"
            }`}
          >
            {formatDateFr(wedding.weddingDate)}
            {wedding.weddingTime ? ` · ${wedding.weddingTime}` : ""}
          </p>
        </div>
      </section>

      {/* MOT DES MARIES — le texte est rendu tel qu'il a ete saisi :
          whitespace-pre-line conserve les retours a la ligne et les lignes
          vides, que le HTML reduirait sinon a une simple espace. */}
      {wedding.message && (
        <Section className="pb-0 sm:pb-0">
          <p
            id="histoire"
            className="mx-auto max-w-xl scroll-mt-8 whitespace-pre-line text-center font-serif text-xl leading-relaxed sm:text-2xl"
          >
            {wedding.message}
          </p>
        </Section>
      )}

      {/* ---------------------------------------------------------------
          LE JOUR J — l'element central : ou etre, et quand
      --------------------------------------------------------------- */}
      {wedding.events.length > 0 && (
        <Section>
          <div id="programme" className="scroll-mt-8">
            <SectionHead eyebrow="Le deroule" title="Le jour J" theme={theme} />
            <Itinerary
              events={wedding.events}
              weddingDate={wedding.weddingDate}
              theme={theme}
            />
          </div>
        </Section>
      )}

      {/* LIEUX — les adresses a rejoindre, sans le detail du programme */}
      {venues.length > 0 && (
        <Section className="pt-0 sm:pt-0">
          <div id="lieux" className="mx-auto max-w-2xl scroll-mt-8">
            <header className="mb-8 text-center">
              <h2 className={`${script.className} text-6xl text-[#0f2d4e] sm:text-7xl`}>
                Les Lieux
              </h2>
              <div
                aria-hidden="true"
                className="mx-auto mt-3 h-2 w-2 rounded-full bg-[#d8c7a0]"
              />
            </header>
            <div className="space-y-14">
              {venues.map(({ event, href }) => (
                <VenueMap
                  key={event.id}
                  event={event}
                  href={href}
                  weddingDate={wedding.weddingDate}
                />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* COMPTE A REBOURS — volontairement discret */}
      <section className="px-5 pb-20 sm:pb-28">
        <Countdown
          date={new Date(wedding.weddingDate).toISOString()}
          accent={theme.accent}
          accentSoft={theme.accentSoft}
        />
      </section>

      {/* GALERIE */}
      {galleryPhotos.length > 0 && (
        <Section>
          <div id="galerie" className="mx-auto max-w-4xl scroll-mt-8">
            <p
              className={`${sans.className} mb-3 text-center text-xs uppercase tracking-[0.28em] text-[#a98f5c] sm:text-sm`}
            >
              Nos moments
            </p>
            <h2
              className={`${script.className} mb-12 text-center text-5xl text-[#0f2d4e] sm:text-7xl`}
            >
              L&apos;amour en images
            </h2>
            <Gallery
              photos={galleryPhotos}
              coupleName={`${wedding.partnerOne} & ${wedding.partnerTwo}`}
            />
          </div>
        </Section>
      )}

      {/* RSVP — la demande, posee sur une surface pleine */}
      <Section>
        <div
          className={`mx-auto max-w-xl rounded-3xl border p-8 sm:p-12 ${theme.surface} ${theme.line}`}
        >
          <SectionHead
            eyebrow="Reponse souhaitee"
            title="Confirmez votre presence"
            theme={theme}
          />
          <RsvpForm
            weddingId={wedding.id}
            accentBtn={accentBtn}
            theme={theme}
          />
        </div>
      </Section>

      {/* PARTAGE */}
      <Section className="pt-0 sm:pt-0">
        <div className="mx-auto max-w-md">
          <SectionHead
            eyebrow="Faites passer"
            title="Partager l'invitation"
            theme={theme}
          />
          <ShareButtons
            weddingId={wedding.id}
            publicUrl={publicUrl}
            partnerOne={wedding.partnerOne}
            partnerTwo={wedding.partnerTwo}
            qrDataUrl={qrDataUrl}
            accentBtn={accentBtn}
            theme={theme}
          />
        </div>
      </Section>

      {/* PIED DE PAGE — l'ornement du theme, une seule fois dans la page */}
      <footer
        id="merci"
        className={`border-t px-5 pb-28 pt-14 text-center ${theme.line}`}
      >
        <div className={`text-lg ${theme.accent}`} aria-hidden="true">
          {theme.divider}
        </div>
        <p className="mt-4 font-serif text-2xl">
          {wedding.partnerOne} &amp; {wedding.partnerTwo}
        </p>
        {wedding.contactPhone && (
          <a
            href={`tel:${wedding.contactPhone.replace(/\s/g, "")}`}
            className={`mt-3 inline-flex min-h-[44px] items-center px-4 text-sm ${theme.accent} transition-opacity hover:opacity-70`}
          >
            {wedding.contactPhone}
          </a>
        )}
        <p className={`mt-8 text-xs ${theme.accentSoft}`}>
          Cree avec Faire-part Digital
        </p>
      </footer>
    </div>
  );
}
