import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import ChatInitializer from "@/components/ChatInitializer";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import SessionProvider from "./(main)/SessionProvider";
import { validateRequest } from "@/auth"; 
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageSync from "@/components/LanguageSync";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | DealCity",
    default: "DealCity - Petites annonces et Deals au Cameroun",
  },
  description: "La plateforme n°1 pour acheter et vendre à Douala, Yaoundé et dans tout le Cameroun. Trouvez les meilleures offres sur DealCity.",
  keywords: ["Cameroun", "Douala", "Yaoundé", "vente en ligne", "petites annonces", "DealCity"],
  openGraph: {
    title: "DealCity - Petites annonces au Cameroun",
    description: "Achetez et vendez en toute sécurité sur la plateforme n°1 au pays.",
    url: "https://dealcity.app",
    siteName: "DealCity",
    images: [
      {
        url: "/logo.png", // Chemin vers ton image dans le dossier public
        width: 1200,
        height: 630,
        alt: "Logo DealCity",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DealCity",
    description: "Les meilleures offres au Cameroun",
    images: ["/logo.png"],
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>
          <LanguageSync>
            <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
            <ReactQueryProvider>
              <SessionProvider value={sessionValues}>
                <ChatInitializer />
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
              </SessionProvider>
            </ReactQueryProvider>
            <Toaster />
          </LanguageSync>
        </LanguageProvider>
      </body>
    </html>
  );
}