import Link from "next/link";
import { ArrowLeft, LifeBuoy, Phone } from "lucide-react";

const contacts = [
  { label: "6 87 30 52 63", href: "tel:+237687305263" },
  { label: "672 01 60 27", href: "tel:+237672016027" },
];

export default function SupportPage() {
  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#4a90e2]">
        <ArrowLeft className="size-4" /> Retour aux paramètres
      </Link>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#4a90e2]/10 flex items-center justify-center">
          <LifeBuoy className="size-5 text-[#4a90e2]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">Support DealCity</h1>
          <p className="text-sm text-muted-foreground">Besoin d’aide avec le site ou votre compte ?</p>
        </div>
      </div>
      <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-4 shadow-sm">
        <p className="text-sm text-foreground">En cas de problème, contactez l’équipe DealCity à l’un de ces numéros :</p>
        {contacts.map((contact) => (
          <a key={contact.href} href={contact.href} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4 text-foreground hover:border-[#4a90e2] hover:text-[#4a90e2] transition-colors">
            <span className="font-bold">{contact.label}</span>
            <Phone className="size-5 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
