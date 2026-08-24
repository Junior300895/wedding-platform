"use client";

import { useEffect, useState } from "react";
import { trackShareAction } from "@/actions/share.actions";
import type { Theme } from "./types";

/** Glyphe de messagerie : porte la reconnaissance, laisse la couleur au theme. */
function ChatGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[1.15em] w-[1.15em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.9A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

export function ShareButtons({
  weddingId,
  publicUrl,
  partnerOne,
  partnerTwo,
  qrDataUrl,
  accentBtn,
  theme,
}: {
  weddingId: string;
  publicUrl: string;
  partnerOne: string;
  partnerTwo: string;
  qrDataUrl: string;
  accentBtn: string;
  theme: Theme;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const waText = encodeURIComponent(
    `Vous etes invite(e) au mariage de ${partnerOne} & ${partnerTwo} !\n${publicUrl}`
  );

  // L'adresse se lit mieux sans le protocole.
  const displayUrl = publicUrl.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!showQr) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQr(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showQr]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      trackShareAction(weddingId, "LINK");
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Presse-papiers indisponible : l'adresse reste lisible et selectionnable.
    }
  }

  return (
    <>
      <div className="mx-auto max-w-md space-y-3 text-left">
        {/* L'action dominante, assumee comme telle */}
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackShareAction(weddingId, "WHATSAPP")}
          className={`flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-medium tracking-wide transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${accentBtn}`}
        >
          <ChatGlyph />
          Envoyer sur WhatsApp
        </a>

        {/* L'adresse, posee comme une ligne gravee plutot qu'un champ */}
        <div
          className={`flex items-center gap-2 rounded-2xl border py-2 pl-4 pr-2 ${theme.surface} ${theme.line}`}
        >
          <span
            className="min-w-0 flex-1 truncate select-all font-sans text-sm tracking-wide opacity-75"
            title={displayUrl}
          >
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={copy}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3.5 text-sm font-medium ${theme.accent} transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
          >
            {copied ? "Copie" : "Copier"}
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          {copied ? "Lien copie dans le presse-papiers" : ""}
        </p>

        {/* Usage etroit, place discrete */}
        <button
          type="button"
          onClick={() => {
            setShowQr(true);
            trackShareAction(weddingId, "QRCODE");
          }}
          className={`mx-auto flex min-h-[44px] items-center px-2 text-xs tracking-wide underline underline-offset-4 ${theme.accentSoft} transition-opacity hover:opacity-70`}
        >
          Afficher le QR code
        </button>
      </div>

      {showQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR code de l'invitation"
          onClick={() => setShowQr(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-3xl bg-white p-7 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="" className="mx-auto h-52 w-52" />
            <p className="mt-5 text-sm text-neutral-600">
              Faites-le scanner par la personne a cote de vous.
            </p>
            <a
              href={qrDataUrl}
              download={`invitation-${partnerOne}-${partnerTwo}.png`}
              className="mt-2 inline-flex min-h-[44px] items-center px-3 text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-800"
            >
              Enregistrer l&apos;image
            </a>
            <button
              type="button"
              autoFocus
              onClick={() => setShowQr(false)}
              className="mt-5 h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
