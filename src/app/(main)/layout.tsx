import { validateRequest } from "@/auth";
import MenuBar from "./MenuBar";
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
        {/* NETTOYAGE : Le ChatInitializer a été supprimé pour stopper 
          les erreurs de timeout et permettre aux posts de charger.
        */}
        
        {session.user && (
          <>
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
            /* OPTIMISATION MOBILE : Le menu est fixé en bas avec un flou 
               pour un rendu fluide sans bloquer le contenu principal (posts).
            */
            <div className="sticky bottom-0 z-50 flex w-full justify-center border-t bg-card/80 backdrop-blur-md p-3 pb-safe sm:hidden">
               <MenuBar className="flex flex-row gap-8 items-center" />
            </div>
          }
        >
          {/* min-w-0 est crucial pour empêcher que les éléments larges 
            ne cassent le layout horizontal sur Android.
          */}
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