import { validateRequest } from "@/auth";
import MenuBar from "./MenuBar";
import ChatInitializer from "@/components/ChatInitializer";
import Navbar from "./Navbar";
import { Analytics } from "@vercel/analytics/react";
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
        {/* Initialisation du Chat si authentifié */}
        {session.user && <ChatInitializer />}
        
        <LayoutClientWrapper
          navbar={<Navbar />}
          menuBar={
            <aside className="sticky top-[5.25rem] hidden h-fit w-52 flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:w-60">
               <MenuBar />
            </aside>
          }
          mobileMenu={
            <div className="sticky bottom-0 z-50 flex w-full justify-center border-t bg-card/80 backdrop-blur-md p-3 sm:hidden">
               <MenuBar className="flex flex-row gap-8 items-center" />
            </div>
          }
        >
          <main className="flex-1 min-w-0 w-full px-2 sm:px-0">
            {children}
          </main>
        </LayoutClientWrapper>

        {/* Placé ici pour suivre toute l'application proprement */}
        <Analytics />
      </SessionProvider>
    </LanguageProvider>
  );
}