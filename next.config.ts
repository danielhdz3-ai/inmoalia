import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.dropxl.com",
      },
      {
        protocol: "https",
        hostname: "cdn.droppery.com",
      },
      /* Imágenes del feed CSV de AW Dropship (CDN Aiku). */
      {
        protocol: "https",
        hostname: "media.aiku.io",
      },
      /* Fotos catálogo Grupo SDM (VENETTO y otros). */
      {
        protocol: "https",
        hostname: "*.gruposdm.com",
      },
      {
        protocol: "https",
        hostname: "gruposdm.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "inmoalia.com", "*.vercel.app"],
    },
  },
};

export default nextConfig;
