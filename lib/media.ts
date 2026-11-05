/**
 * Regles communes aux medias, sans dependance serveur : ce module est aussi
 * importe par les composants clients.
 */
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 Mo

export function isVideo(mimeType?: string | null): boolean {
  return !!mimeType && mimeType.startsWith("video/");
}

export function validateVideoFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!VIDEO_MIME_TYPES.includes(file.type)) {
    return "Format non supporte (MP4, WebM ou MOV)";
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return "Video trop lourde (max 50 Mo)";
  }
  return null;
}
