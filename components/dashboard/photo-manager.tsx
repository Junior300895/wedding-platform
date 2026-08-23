"use client";

import { useActionState, useRef, useTransition } from "react";
import {
  uploadPhotoAction,
  deletePhotoAction,
  setCoverPhotoAction,
} from "@/actions/photo.actions";
import { Button } from "@/components/ui/button";

type Photo = { id: string; url: string; isCover: boolean };

export function PhotoManager({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: Photo[];
}) {
  const action = uploadPhotoAction.bind(null, weddingId);
  const [state, formAction, uploading] = useActionState(action, {});
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-5">
      <form
        ref={formRef}
        action={(fd) => {
          formAction(fd);
          formRef.current?.reset();
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:text-white"
        />
        <Button type="submit" size="sm" disabled={uploading}>
          {uploading ? "Envoi..." : "Ajouter"}
        </Button>
      </form>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-xl border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="aspect-square w-full object-cover" />
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
