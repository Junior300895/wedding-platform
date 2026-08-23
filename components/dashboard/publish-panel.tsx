"use client";

import { useState, useTransition } from "react";
import {
  publishWeddingAction,
  unpublishWeddingAction,
  archiveWeddingAction,
  deleteWeddingAction,
} from "@/actions/wedding.actions";
import { Button } from "@/components/ui/button";

export function PublishPanel({
  weddingId,
  status,
  publicUrl,
  partnerOne,
  partnerTwo,
}: {
  weddingId: string;
  status: string;
  publicUrl: string;
  partnerOne: string;
  partnerTwo: string;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const waText = encodeURIComponent(
    `Vous etes invite(e) au mariage de ${partnerOne} & ${partnerTwo} !\n${publicUrl}`
  );
  const waUrl = `https://wa.me/?text=${waText}`;

  function copy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-neutral-700">Statut actuel</p>
        <p className="mt-1 text-sm text-neutral-500">
          {status === "PUBLISHED"
            ? "Votre invitation est en ligne et partageable."
            : status === "ARCHIVED"
            ? "Cette invitation est archivee."
            : "Brouillon : publiez pour rendre l'invitation accessible."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {status !== "PUBLISHED" && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => publishWeddingAction(weddingId))}
          >
            Publier
          </Button>
        )}
        {status === "PUBLISHED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => unpublishWeddingAction(weddingId))}
          >
            Repasser en brouillon
          </Button>
        )}
        {status !== "ARCHIVED" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => startTransition(() => archiveWeddingAction(weddingId))}
          >
            Archiver
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:bg-red-50"
          disabled={pending}
          onClick={() => {
            if (confirm("Supprimer definitivement ce mariage ?")) {
              startTransition(() => deleteWeddingAction(weddingId));
            }
          }}
        >
          Supprimer
        </Button>
      </div>

      {status === "PUBLISHED" && (
        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <p className="text-sm font-medium text-neutral-700">Partager</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={publicUrl}
              className="h-10 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600"
            />
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? "Copie !" : "Copier"}
            </Button>
          </div>
          <div className="flex gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Partager sur WhatsApp
            </a>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Voir la page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
