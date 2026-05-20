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
  const sessionValues = await validateRequest();

  return (
    <html lang="fr" suppressHydrationWarning>
      {/* CORRECTION : Suppression de toute classe de hauteur fixe sur le body.
        Le 'sticky' a besoin que le scroll soit géré par le navigateur (body) 
        et non par un conteneur interne pour fonctionner correctement. 
      */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <ReactQueryProvider>
              <SessionProvider value={sessionValues}>
                <LanguageSync>
                  <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
                  
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