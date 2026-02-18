import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Facebook, Instagram, ShoppingBag, CalendarDays, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

type PioneerWithStats = Prisma.UserGetPayload<{
  select: {
    id: true;
    displayName: true;
    username: true;
    avatarUrl: true;
    whatsappUrl: true;
    tiktokUrl: true;
    facebookUrl: true;
    instagramUrl: true;
    createdAt: true;
    _count: { select: { posts: true } };
  };
}>;

export default async function PioneersDirectoryPage() {
  const { user: admin } = await validateRequest();

  if (!admin || admin.id !== "4yq76ntw6lpduptd") {
    redirect("/");
  }

  const pioneers = (await prisma.user.findMany({
    where: { isPioneer: true },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      whatsappUrl: true,
      tiktokUrl: true,
      facebookUrl: true,
      instagramUrl: true,
      createdAt: true,
      _count: { select: { posts: true } }
    },
    orderBy: { displayName: "asc" }
  })) as unknown as PioneerWithStats[];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Répertoire Pionniers</h1>
        <p className="text-muted-foreground text-sm font-medium">Gestion des contacts et suivi d&apos;activité vendeurs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pioneers.map((pioneer) => (
          <Card key={pioneer.id} className="rounded-[2rem] border-none shadow-lg overflow-hidden transition-all hover:shadow-2xl bg-card">
            <div className="bg-muted/30 p-6 flex flex-col items-center text-center relative">
              <UserAvatar avatarUrl={pioneer.avatarUrl} size={100} className="border-4 border-background shadow-md" />
              <h2 className="mt-4 text-xl font-bold line-clamp-1">{pioneer.displayName}</h2>
              <p className="text-primary font-black italic text-xs">@{pioneer.username}</p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Stats Section */}
              <div className="flex justify-around bg-muted/50 py-4 rounded-2xl">
                <div className="text-center">
                   <ShoppingBag className="mx-auto size-4 text-muted-foreground mb-1" />
                   <p className="text-sm font-black">{pioneer._count.posts}</p>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">Articles</p>
                </div>
                <div className="text-center border-l border-muted-foreground/20 pl-6">
                   <CalendarDays className="mx-auto size-4 text-muted-foreground mb-1" />
                   <p className="text-sm font-black italic">{new Date(pioneer.createdAt).toLocaleDateString()}</p>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">Inscrit</p>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic px-1">Canaux prioritaires</p>
                
                <div className="flex flex-col gap-2">
                  {/* TIKTOK - Corrigé pour éviter le 404 et l'erreur React */}
                  {pioneer.tiktokUrl ? (
                    <a 
                      href={pioneer.tiktokUrl.startsWith("http") ? pioneer.tiktokUrl : `https://www.tiktok.com/@${pioneer.tiktokUrl.replace("@", "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-zinc-900 text-white p-3 rounded-xl hover:opacity-90 transition-all group"
                    >
                      <span className="text-lg font-black italic ml-1">TikTok</span>
                      <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <div className="p-3 border-2 border-dashed rounded-xl text-[10px] text-center italic text-muted-foreground">TikTok non renseigné</div>
                  )}

                  {/* WHATSAPP */}
                  {pioneer.whatsappUrl && (
                    <a href={pioneer.whatsappUrl} target="_blank" className="flex items-center gap-3 bg-green-500/10 text-green-600 p-3 rounded-xl hover:bg-green-500 hover:text-white transition-colors">
                      <MessageCircle size={18} />
                      <span className="text-xs font-black uppercase tracking-tight">WhatsApp Business</span>
                    </a>
                  )}

                  {/* FB & IG */}
                  <div className="flex gap-2">
                    {pioneer.facebookUrl && (
                      <a href={pioneer.facebookUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-blue-600/10 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                        <Facebook size={16} />
                        <span className="text-[10px] font-black uppercase">FB</span>
                      </a>
                    )}
                    {pioneer.instagramUrl && (
                      <a href={pioneer.instagramUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-pink-600/10 text-pink-600 p-3 rounded-xl hover:bg-pink-600 hover:text-white transition-colors">
                        <Instagram size={16} />
                        <span className="text-[10px] font-black uppercase">IG</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}