"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadPhotoAction,
  deletePhotoAction,
  setCoverPhotoAction,
} from "@/actions/photo.actions";
import { Button } from "@/components/ui/button";
import { isVideo } from "@/lib/media";
import { CoverVideoUpload } from "./cover-video-upload";

/** Memes regles que le serveur (lib/storage.ts), verifiees avant l'envoi. */
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024;

type Photo = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  isCover: boolean;
};

export function PhotoManager({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: Photo[];
}) {
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  // Avancement de l'envoi groupe : "3 / 10", null hors envoi.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Une photo par requete, l'une apres l'autre : chaque envoi reste sous la
   * limite de taille d'une requete, et un echec n'arrete pas les suivantes.
   */
  async function uploadAll(files: File[]) {
    setErrors([]);
    setProgress({ done: 0, total: files.length });
    const failed: string[] = [];

    for (const [i, file] of files.entries()) {
      if (!ACCEPTED.includes(file.type)) {
        failed.push(`${file.name} : format non supporte (JPG, PNG ou WebP)`);
      } else if (file.size > MAX_SIZE) {
        failed.push(`${file.name} : fichier trop lourd (max 8 Mo)`);
      } else {
        const body = new FormData();
        body.append("file", file);
        try {
          const result = await uploadPhotoAction(weddingId, {}, body);
          if (result.error) failed.push(`${file.name} : ${result.error}`);
        } catch {
          failed.push(`${file.name} : l'envoi a echoue`);
        }
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setErrors(failed);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const uploading = progress !== null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          aria-label="Choisir des photos"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) void uploadAll(files);
          }}
        />
        <Button
          type="button"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? `Envoi ${progress.done} / ${progress.total}...`
            : "Ajouter des photos"}
        </Button>
        <p className="text-xs text-neutral-500">
          Plusieurs photos a la fois possible. JPG, PNG ou WebP, 8 Mo maximum chacune.
        </p>
      </div>

      <CoverVideoUpload weddingId={weddingId} />

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-medium">
            {errors.length} photo{errors.length > 1 ? "s" : ""} non ajoutee
            {errors.length > 1 ? "s" : ""} :
          </p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-xl border border-neutral-200">
              {isVideo(p.mimeType) ? (
                <video
                  src={p.url}
                  poster={p.thumbnailUrl ?? undefined}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
              )}
              {isVideo(p.mimeType) && (
                <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs text-white">
                  Video
                </span>
              )}
              {p.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
                  Couverture
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!p.isCover && (
                  <button
                    disabled={pending}
                    onClick={() => startTransition(() => setCoverPhotoAction(p.id))}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-neutral-800"
                  >
                    Couverture
                  </button>
                )}
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => deletePhotoAction(p.id))}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
