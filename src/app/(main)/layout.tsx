import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import HideOnScrollMobileMenu from "@/components/HideOnScrollMobileMenu";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LayoutClientWrapper
        navbar={<Navbar />}
        menuBar={
          <aside className="sticky top-[5.25rem] hidden h-fit w-52 flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:w-60">
             <MenuBar />
          </aside>
        }
        mobileMenu={
          <HideOnScrollMobileMenu>
             <MenuBar className="flex flex-row gap-8 items-center" />
          </HideOnScrollMobileMenu>
        }
      >
        <main className="flex-1 min-w-0 w-full px-2 sm:px-0">
          {children}
        </main>
      </LayoutClientWrapper>
      <footer className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-2 px-4 py-6 text-xs text-muted-foreground">
        <a href="/conditions-utilisation" className="hover:underline">Conditions d’utilisation</a>
        <a href="/confidentialite" className="hover:underline">Confidentialité</a>
        <a href="/cookies" className="hover:underline">Cookies</a>
        <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
      </footer>
    </>
  );
}