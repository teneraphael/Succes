import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    image: '/icons/icon-192.png',
  },
  runtimeCaching: [
    // ✅ Images UploadThing ufs.sh
    {
      urlPattern: /^https:\/\/.*\.ufs\.sh\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "uploadthing-images",
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200], // ✅ 0 = opaque (cross-origin mobile)
        },
        fetchOptions: {
          mode: 'no-cors', // ✅ Force le cache sur mobile
        },
      },
    },
    // ✅ Images utfs.io
    {
      urlPattern: /^https:\/\/utfs\.io\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "uploadthing-images",
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        fetchOptions: {
          mode: 'no-cors',
        },
      },
    },
    // ✅ Avatars Google
    {
      urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-avatars",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        fetchOptions: {
          mode: 'no-cors',
        },
      },
    },
    // ✅ Fichiers statiques Next.js
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ✅ Next image optimizer
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-image",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ✅ Images statiques locales
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ✅ Sons
    {
      urlPattern: /\/sounds\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        rangeRequests: true,
      },
    },
    // ✅ API posts — NetworkFirst avec fallback cache
    {
      urlPattern: /\/api\/posts.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-posts",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ✅ Pages app
    {
      urlPattern: /^https:\/\/dealcity\.app\/(?!api\/).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
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
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "un9zgttebh.ufs.sh" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: false,
    minimumCacheTTL: 60 * 60 * 24 * 7,
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 64, 96, 128, 256],
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