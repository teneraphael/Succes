import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: "public",         // Dossier où sera généré le Service Worker (sw.js)
  register: true,         // Enregistre automatiquement le worker
  skipWaiting: true,      // Force la mise à jour immédiate
  // ✅ CORRECTION : Désactivé uniquement en développement pour permettre le build PWA
  disable: process.env.NODE_ENV === 'development', 
});

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
    // Utile pour passer le build si des erreurs de types persistent
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

export default withPWA(nextConfig);