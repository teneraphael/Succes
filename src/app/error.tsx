"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-foreground">Cette page n’a pas pu s’afficher.</h1>
      <p className="text-sm text-muted-foreground">Vérifiez votre connexion Internet et réessayez. Si le problème continue, contactez le support DealCity.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Réessayer</button>
        <Link href="/settings/support" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground">Contacter le support</Link>
      </div>
    </main>
  );
}
