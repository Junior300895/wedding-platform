import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Les invitations ont d'abord ete publiees sous /mariage/<slug>. Les liens
  // deja envoyes et les QR codes imprimes pointent encore vers ce chemin :
  // redirection permanente vers /event/<slug> (voir lib/routes.ts).
  async redirects() {
    return [
      {
        source: "/mariage/:slug",
        destination: "/event/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
