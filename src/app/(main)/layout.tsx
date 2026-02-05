import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import MenuBar from "./MenuBar";
import ChatInitializer from "@/components/ChatInitializer";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import { LanguageProvider } from "@/components/LanguageProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <LanguageProvider>
      <SessionProvider value={session}>
        <ChatInitializer />
        
        <LayoutClientWrapper
          navbar={<Navbar />}
          menuBar={
            /* SUR ORDINATEUR (sm:block) : On garde notre largeur de 280px.
               SUR MOBILE (hidden) : La sidebar est totalement cachée pour laisser la place au Dashboard.
            */
            <aside className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5">
               <MenuBar />
            </aside>
          }
          mobileMenu={
            /* SUR MOBILE : On affiche le menu tout en bas de l'écran, bien centré. */
            <div className="sticky bottom-0 z-50 flex w-full justify-center border-t bg-card p-3 sm:hidden">
               <MenuBar className="flex flex-row gap-8" />
            </div>
          }
        >
          {/* SUR MOBILE : 'flex-1' permet au dashboard de prendre 100% de la largeur du téléphone. */}
          <main className="flex-1 min-w-0 w-full px-2 sm:px-0">
            {children}
          </main>
        </LayoutClientWrapper>
      </SessionProvider>
    </LanguageProvider>
  );
}