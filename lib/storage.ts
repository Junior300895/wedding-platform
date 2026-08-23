import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Abstraction de stockage des medias.
 *
 * Provider par defaut : "local" -> ecrit dans /public/uploads (aucune config).
 * Pour la production, brancher Cloudinary ou un stockage S3/Supabase compatible
 * en implementant l'interface StorageProvider ci-dessous.
 */

export interface StoredFile {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(file: File, folder: string): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: "Format non supporte (JPG, PNG ou WebP)" };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Fichier trop lourd (max 8 Mo)" };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Implementation LOCALE (developpement)
// ---------------------------------------------------------------------------

class LocalStorage implements StorageProvider {
  private baseDir = path.join(process.cwd(), "public", "uploads");

  async upload(file: File, folder: string): Promise<StoredFile> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;
    const dest = path.join(this.baseDir, key);
    await mkdir(path.dirname(dest), { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(dest, bytes);
    return {
      storageKey: key,
      url: `/uploads/${key}`,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await unlink(path.join(this.baseDir, storageKey));
    } catch {
      // fichier deja absent : on ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Stubs providers production (a completer selon le choix retenu)
// ---------------------------------------------------------------------------
//
// class CloudinaryStorage implements StorageProvider { ... }
// class S3Storage implements StorageProvider { ... }
//
// Voir README section "Stockage medias" pour la marche a suivre.

function getStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  switch (provider) {
    case "local":
      return new LocalStorage();
    // case "cloudinary": return new CloudinaryStorage();
    // case "s3": return new S3Storage();
    default:
      console.warn(
        `STORAGE_PROVIDER="${provider}" non implemente, fallback "local".`
      );
      return new LocalStorage();
  }
}

export const storage = getStorage();
