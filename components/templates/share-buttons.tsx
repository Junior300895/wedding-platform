"use client";

import { useEffect, useState } from "react";
import { trackShareAction } from "@/actions/share.actions";
import type { Theme } from "./types";

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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers refuse (contexte non securise) : on ne fait rien,
      // le lien reste selectionnable dans la barre d'adresse.
    }
  }

  const pill =
    "inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-sm font-medium transition-colors";

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackShareAction(weddingId, "WHATSAPP")}
          className={`${pill} bg-[#25D366] text-neutral-900 hover:bg-[#1eb958]`}
        >
          Partager sur WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className={`${pill} border ${theme.surface} ${theme.line} hover:opacity-80`}
        >
          {copied ? "Lien copie !" : "Copier le lien"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowQr(true);
            trackShareAction(weddingId, "QRCODE");
          }}
          className={`${pill} ${accentBtn}`}
        >
          QR code
        </button>
      </div>

      {showQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR code de l'invitation"
          onClick={() => setShowQr(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl bg-white p-8 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="" className="mx-auto h-56 w-56" />
            <p className="mt-4 text-sm text-neutral-600">
              Scannez pour ouvrir l&apos;invitation
            </p>
            <a
              href={qrDataUrl}
              download={`qr-${partnerOne}-${partnerTwo}.png`}
              className="mt-5 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Telecharger le QR code
            </a>
            <button
              type="button"
              autoFocus
              onClick={() => setShowQr(false)}
              className="mt-3 block w-full text-sm text-neutral-500 hover:text-neutral-800"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
