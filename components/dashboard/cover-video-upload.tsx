"use client";

import { useRef, useState } from "react";
import {
  completeVideoUploadAction,
  prepareVideoUploadAction,
  uploadLocalVideoAction,
  type VideoUploadTarget,
} from "@/actions/photo.actions";
import { Button } from "@/components/ui/button";

type DirectTarget = Extract<VideoUploadTarget, { mode: "direct" }>;

/** Envoi direct a Cloudinary ; XHR plutot que fetch pour suivre la progression. */
function sendToCloudinary(
  file: File,
  target: DirectTarget,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", target.apiKey);
    body.append("folder", target.folder);
    body.append("allowed_formats", target.allowedFormats);
    body.append("timestamp", String(target.timestamp));
    body.append("signature", target.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${target.cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).public_id);
      } else {
        reject(new Error(`cloudinary ${xhr.status}`));
      }
    };
    xhr.send(body);
  });
}

export function CoverVideoUpload({ weddingId }: { weddingId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setProgress(null);
    setError(null);
    try {
      const prepared = await prepareVideoUploadAction(weddingId, {
        type: file.type,
        size: file.size,
      });
      if ("error" in prepared) {
        setError(prepared.error);
        return;
      }

      let result;
      if (prepared.target.mode === "direct") {
        const publicId = await sendToCloudinary(file, prepared.target, setProgress);
        result = await completeVideoUploadAction(weddingId, publicId);
      } else {
        const body = new FormData();
        body.append("file", file);
        result = await uploadLocalVideoAction(weddingId, body);
      }
      if (result.error) setError(result.error);
    } catch (e) {
      console.error(e);
      setError("L'envoi de la video a echoue. Reessayez dans un instant.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="text-sm font-medium text-neutral-900">Video de couverture</p>
      <p className="mt-1 text-xs text-neutral-500">
        MP4, WebM ou MOV, 50 Mo maximum. Elle remplace la couverture actuelle et
        tourne en boucle, sans le son. Quelques secondes suffisent.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          aria-label="Choisir une video de couverture"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? progress === null
              ? "Envoi..."
              : `Envoi ${progress} %`
            : "Choisir une video"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
