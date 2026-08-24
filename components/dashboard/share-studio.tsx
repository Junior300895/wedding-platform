"use client";

import { useState } from "react";
import { trackShareAction } from "@/actions/share.actions";

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-neutral-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const action =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors";

export function ShareStudio({
  weddingId,
  publicUrl,
  partnerOne,
  partnerTwo,
  weddingDate,
  qrSvgDataUri,
  qrPngHiRes,
}: {
  weddingId: string;
  publicUrl: string;
  partnerOne: string;
  partnerTwo: string;
  weddingDate: string;
  qrSvgDataUri: string;
  qrPngHiRes: string;
}) {
  const [copied, setCopied] = useState(false);
  const displayUrl = publicUrl.replace(/^https?:\/\//, "");
  const fileBase = `qr-${partnerOne}-${partnerTwo}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "-");

  const message = `Vous etes invite(e) au mariage de ${partnerOne} & ${partnerTwo}, le ${weddingDate}.\n${publicUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      trackShareAction(weddingId, "LINK");
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Presse-papiers refuse : l'adresse reste selectionnable a l'ecran.
    }
  }

  return (
    <>
      <Card
        title="Le lien"
        hint="C'est la seule chose a transmettre. Il ouvre l'invitation sur n'importe quel telephone, sans installation ni compte."
      >
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-4 pr-2">
          <span className="min-w-0 flex-1 select-all truncate text-sm text-neutral-800">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className={`${action} shrink-0 text-brand-700 hover:bg-brand-50`}
          >
            {copied ? "Copie !" : "Copier"}
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {copied ? "Lien copie dans le presse-papiers" : ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackShareAction(weddingId, "WHATSAPP")}
            className={`${action} flex-1 bg-brand-600 text-white hover:bg-brand-700`}
          >
            Envoyer sur WhatsApp
          </a>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${action} border border-neutral-300 text-neutral-800 hover:bg-neutral-50`}
          >
            Voir la page
          </a>
        </div>

        <details className="mt-4 rounded-xl bg-neutral-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            Le message envoye
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm text-neutral-600">
            {message}
          </p>
        </details>
      </Card>

      <Card
        title="Le QR code"
        hint="Pour vos cartons imprimes, l'affiche a l'entree de la salle ou le programme papier. Il pointe vers la meme invitation."
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSvgDataUri} alt="" className="h-44 w-44" />
          </div>

          <div className="w-full space-y-3">
            <a
              href={qrSvgDataUri}
              download={`${fileBase}.svg`}
              onClick={() => trackShareAction(weddingId, "QRCODE")}
              className={`${action} w-full bg-neutral-900 text-white hover:bg-neutral-800`}
            >
              Telecharger en SVG
            </a>
            <p className="text-xs text-neutral-500">
              A donner a votre imprimeur : le SVG reste net a n&apos;importe
              quelle taille, d&apos;une carte de visite a une affiche.
            </p>

            <a
              href={qrPngHiRes}
              download={`${fileBase}.png`}
              onClick={() => trackShareAction(weddingId, "QRCODE")}
              className={`${action} w-full border border-neutral-300 text-neutral-800 hover:bg-neutral-50`}
            >
              Telecharger en PNG
            </a>
            <p className="text-xs text-neutral-500">
              2048 pixels de cote, pour un document Word ou un partage rapide.
            </p>
          </div>
        </div>

        <p className="mt-5 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
          Testez-le avant de lancer l&apos;impression : scannez-le avec votre
          propre telephone pour verifier qu&apos;il ouvre bien votre invitation.
        </p>
      </Card>
    </>
  );
}
