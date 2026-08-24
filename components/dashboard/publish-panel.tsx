"use client";

import Link from "next/link";
import { useTransition } from "react";
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
}: {
  weddingId: string;
  status: string;
  publicUrl: string;
}) {
  const [pending, startTransition] = useTransition();

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

      {/* Le partage a sa propre page : lien, QR imprimable et diffusion. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-5">
        <Link
          href={`/dashboard/mariage/${weddingId}/partage`}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Partager l&apos;invitation
        </Link>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Voir la page
        </a>
      </div>
    </div>
  );
}
