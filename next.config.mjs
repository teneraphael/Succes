import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "un9zgttebh.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  rewrites: async () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
};

// On enveloppe la configuration avec le plugin PWA
export default withPWA({
  dest: "public",         // Dossier où sera généré le Service Worker (sw.js)
  register: true,       // Enregistre automatiquement le worker
  skipWaiting: true,    // Force la mise à jour immédiate
  disable: process.env.NODE_ENV === "development", // Désactivé en dev pour ne pas bloquer le cache
})(nextConfig);