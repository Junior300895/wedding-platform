import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

/**
 * Abstraction de stockage des medias.
 *
 * STORAGE_PROVIDER choisit ou partent les NOUVEAUX fichiers :
 *   - "local"      -> /public/uploads (developpement, aucune config)
 *   - "cloudinary" -> Cloudinary (production ; obligatoire sur Vercel, dont
 *                     le systeme de fichiers est en lecture seule)
 *
 * La suppression, elle, ne depend pas du provider actif : elle lit
 * l'origine de chaque fichier dans sa cle. Des photos envoyees en local
 * restent donc supprimables apres le passage a Cloudinary.
 */

export interface StoredFile {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface StorageProvider {
  upload(file: File, folder: string): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}

/** Types acceptes, et l'extension qu'on en deduit. */
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!MIME_EXTENSIONS[file.type]) {
    return { ok: false, error: "Format non supporte (JPG, PNG ou WebP)" };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Fichier trop lourd (max 8 Mo)" };
  }
  return { ok: true };
}

/** Prefixe des cles Cloudinary ; une cle sans prefixe est un fichier local. */
const CLOUDINARY_PREFIX = "cloudinary:";

// ---------------------------------------------------------------------------
// LOCAL (developpement)
// ---------------------------------------------------------------------------

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

class LocalStorage implements StorageProvider {
  async upload(file: File, folder: string): Promise<StoredFile> {
    // Extension deduite du type MIME valide, jamais du nom de fichier :
    // un nom comme "x./../../y" ferait sortir le fichier de /uploads.
    const ext = MIME_EXTENSIONS[file.type] ?? "jpg";
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;
    const dest = path.join(LOCAL_DIR, key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await file.arrayBuffer()));
    return {
      storageKey: key,
      url: `/uploads/${key}`,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const target = path.resolve(LOCAL_DIR, storageKey);
    // Garde-fou : ne jamais effacer hors du dossier d'uploads.
    if (!target.startsWith(LOCAL_DIR + path.sep)) return;
    try {
      await unlink(target);
    } catch {
      // fichier deja absent : on ignore
    }
  }
}

// ---------------------------------------------------------------------------
// CLOUDINARY (production)
// ---------------------------------------------------------------------------

/** Dossier racine sur le compte Cloudinary, pour ne pas melanger les projets. */
const CLOUDINARY_ROOT = "faire-part";

let cloudinaryConfigured = false;

/**
 * Configuration a la demande : le module s'importe sans identifiants (build,
 * dev en local), l'erreur n'arrive qu'au moment d'un vrai envoi.
 */
function ensureCloudinary() {
  if (cloudinaryConfigured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary n'est pas configure : renseignez CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET."
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  cloudinaryConfigured = true;
}

class CloudinaryStorage implements StorageProvider {
  async upload(file: File, folder: string): Promise<StoredFile> {
    ensureCloudinary();
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${CLOUDINARY_ROOT}/${folder}`,
            resource_type: "image",
            allowed_formats: ["jpg", "png", "webp"],
            unique_filename: true,
            overwrite: false,
          },
          (error, res) => (error || !res ? reject(error) : resolve(res))
        )
        .end(buffer);
    });

    // Livraison optimisee : format (WebP/AVIF) et qualite choisis par
    // Cloudinary selon le navigateur, largeur plafonnee. Decisif pour des
    // invites qui ouvrent la page sur donnees mobiles.
    const url = cloudinary.url(result.public_id, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
      crop: "limit",
      width: 2000,
      version: result.version,
    });
    const thumbnailUrl = cloudinary.url(result.public_id, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
      crop: "fill",
      gravity: "auto",
      width: 600,
      height: 600,
      version: result.version,
    });

    return {
      storageKey: `${CLOUDINARY_PREFIX}${result.public_id}`,
      url,
      thumbnailUrl,
      size: result.bytes,
      mimeType: file.type,
      width: result.width,
      height: result.height,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const publicId = storageKey.slice(CLOUDINARY_PREFIX.length);
    ensureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

const local = new LocalStorage();
const cloud = new CloudinaryStorage();

function uploader(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider === "cloudinary") return cloud;
  if (provider !== "local") {
    // Pas de repli silencieux : en production, ecrire en local sur un
    // systeme de fichiers ephemere ferait perdre les photos sans erreur.
    throw new Error(`STORAGE_PROVIDER="${provider}" non pris en charge.`);
  }
  return local;
}

export const storage: StorageProvider = {
  upload: (file, folder) => uploader().upload(file, folder),
  delete: (storageKey) =>
    storageKey.startsWith(CLOUDINARY_PREFIX)
      ? cloud.delete(storageKey)
      : local.delete(storageKey),
};
