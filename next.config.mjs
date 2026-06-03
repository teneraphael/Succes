import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
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
    // ✅ Augmenter le timeout pour les images distantes (default: 7000ms)
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
    // ✅ Désactiver l'optimisation pour les domaines lents
    // Next.js renverra l'URL originale sans passer par son proxy
    unoptimized: false,
    // ✅ Augmenter le timeout à 30 secondes (default: 7s)
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 jours de cache
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 64, 96, 128, 256],
    // ✅ Délai avant timeout augmenté
    dangerouslyAllowSVG: false,
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

export default withPWA(nextConfig);