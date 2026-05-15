import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import CookieBanner from "@/components/CookieBanner";
import { Toaster as SonnerToaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import NotificationHandler from "@/components/NotificationHandler";
import SessionProvider from "./(main)/SessionProvider";
import { validateRequest } from "@/auth"; 
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageSync from "@/components/LanguageSync";
import { CartProvider } from "@/context/cart-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dealcity.app"),
  title: {
    template: "%s | DealCity",
    default: "DealCity - Petites annonces et Deals au Cameroun",
  },
  description: "La plateforme n°1 pour acheter et vendre au Cameroun.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DealCity",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupération de la session côté serveur
  const sessionValues = await validateRequest();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {/* CORRECTION 1: On s'assure que ReactQueryProvider enveloppe tout 
                ce qui utilise des hooks de données. */}
            <ReactQueryProvider>
              <SessionProvider value={sessionValues}>
                <LanguageSync>
                  {/* CORRECTION 2: Le NextSSRPlugin peut causer des erreurs d'hydratation 
                      s'il n'est pas placé correctement. */}
                  <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
                  
                  {/* CORRECTION 3: Protection du NotificationHandler. 
                      S'il demande des permissions trop vite sur mobile, ça crash. */}
                  {sessionValues.user && <NotificationHandler />}
                  
                  <CartProvider>
                    {children}
                  </CartProvider>
                  
                  <CookieBanner />
                  <SonnerToaster richColors position="top-center" />
                  <Toaster />
                </LanguageSync>
              </SessionProvider>
            </ReactQueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}