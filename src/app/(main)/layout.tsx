import { validateRequest } from "@/auth";
import MenuBar from "./MenuBar";
import ChatInitializer from "@/components/ChatInitializer";
import Navbar from "./Navbar";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import NotificationHandler from "@/components/NotificationHandler";
import SessionProvider from "./SessionProvider";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import { LanguageProvider } from "@/components/LanguageProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  return (
    <LanguageProvider>
      <SessionProvider value={session}>
        {/* CORRECTION 1: On ne rend ces composants QUE si l'utilisateur est connecté.
          C'est crucial car NotificationHandler peut faire planter le navigateur mobile 
          s'il demande des permissions trop tôt ou sans session.
        */}
        {session.user && (
          <>
            <ChatInitializer />
            <NotificationHandler />
          </>
        )}
        
        <LayoutClientWrapper
          navbar={<Navbar />}
          menuBar={
            <aside className="sticky top-[5.25rem] hidden h-fit w-52 flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:w-60">
               <MenuBar />
            </aside>
          }
          mobileMenu={
            /* CORRECTION 2: Ajout d'une protection sur le menu mobile pour éviter 
              les décalages de rendu (Layout Shift) qui font souvent planter Safari/Chrome Mobile.
            */
            <div className="sticky bottom-0 z-50 flex w-full justify-center border-t bg-card/80 backdrop-blur-md p-3 pb-safe sm:hidden">
               <MenuBar className="flex flex-row gap-8 items-center" />
            </div>
          }
        >
          <main className="flex-1 min-w-0 w-full px-2 sm:px-0">
            {children}
          </main>
        </LayoutClientWrapper>

        <CookieBanner />
        <Analytics />
      </SessionProvider>
    </LanguageProvider>
  );
}