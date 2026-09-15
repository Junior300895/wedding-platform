import type { PublicWedding, Theme } from "./types";
import { getTheme, getAccentButton } from "./registry";
import { Confetti } from "./confetti";
import { Countdown } from "./countdown";
import { Itinerary } from "./itinerary";
import { Gallery } from "./gallery";
import { RsvpForm } from "./rsvp-form";
import { ShareButtons } from "./share-buttons";
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
  const cover =
    wedding.photos.find((p) => p.isCover)?.url ??
    wedding.photos[0]?.url ??
    wedding.coverImageUrl ??
    null;
  const galleryPhotos = wedding.photos.filter((p) => p.url !== cover);

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen`}>
      {/* Confettis : couche fixe au-dessus de la page, inerte au clic et
          masquee pour qui a demande moins de mouvement. */}
      <Confetti colors={theme.confetti} />

      {/* ---------------------------------------------------------------
          HERO — la photo porte l'ouverture, le voile garde le titre lisible
      --------------------------------------------------------------- */}
      <section
        className={`relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center ${theme.heroBgClass}`}
      >
        {cover && (
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
        )}

        <div className="relative animate-fade-in-up">
          <p className={`text-[0.7rem] uppercase tracking-[0.35em] ${theme.accentSoft}`}>
            {/* Nous nous marions */}
            2A DECO PROGRAMME
          </p>

          <h1
            className={`${theme.heroFont} mt-7 text-6xl leading-[0.95] sm:text-8xl`}
          >
            <span className="block">{wedding.partnerOne}</span>
            <span className={`my-2 block text-3xl sm:text-4xl ${theme.accent}`}>
              &amp;
            </span>
            <span className="block">{wedding.partnerTwo}</span>
          </h1>

          <p className="mt-9 font-sans text-sm uppercase tracking-[0.2em] sm:text-base">
            {formatDateFr(wedding.weddingDate)}
            {wedding.weddingTime ? ` · ${wedding.weddingTime}` : ""}
          </p>
        </div>

        {wedding.events.length > 0 && (
          <a
            href="#programme"
            className={`absolute bottom-8 flex flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] ${theme.accentSoft} transition-opacity hover:opacity-60`}
          >
            Le programme
            <span aria-hidden="true" className="text-base">
              &darr;
            </span>
          </a>
        )}
      </section>

      {/* MOT DES MARIES — une seule ligne tenue, rien autour */}
      {wedding.message && (
        <Section className="pb-0 sm:pb-0">
          <p className="mx-auto max-w-xl text-balance text-center font-serif text-xl leading-relaxed sm:text-2xl">
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
          <div className="mx-auto max-w-4xl">
            <SectionHead eyebrow="Un aperçu de" title="Notre histoire" theme={theme} />
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
      <footer className={`border-t px-5 py-14 text-center ${theme.line}`}>
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
