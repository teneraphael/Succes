"use client";

import { PostData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, MessageSquare, Heart, Loader2, 
  Pencil, RefreshCw, Check, ArrowLeft, Package, Sparkles
} from "lucide-react";
import { deletePost, updatePost } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

export default function MyPostsClient({ posts }: { posts: PostData[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article définitivement ?")) return;
    setDeletingId(id);
    try {
      await deletePost(id);
    } catch (e) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRepublish(post: PostData) {
    setIsLoading(true);
    try {
      await updatePost(post.id, post.content, true);
      alert("Article remonté en haut de liste ! ✨");
    } catch (e) {
      alert("Erreur");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setIsLoading(true);
    try {
      await updatePost(id, editContent, false);
      setEditingId(null);
    } catch (e) {
      alert("Erreur");
    } finally {
      setIsLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
        <div className="p-6 rounded-full bg-muted/30">
          <Package className="size-12 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold">Aucun article en vente</p>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Commencez à publier pour voir vos articles apparaître ici.
          </p>
        </div>
        <Button onClick={() => router.push("/post/new")} className="rounded-2xl px-8 font-bold">
          Publier mon premier article
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* HEADER PREMIUM */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 md:rounded-3xl border-b md:border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" size="icon" 
              onClick={() => router.back()} 
              className="rounded-full bg-background/50 backdrop-blur-sm border-primary/20 sm:hidden"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                Mes <span className="text-primary">Articles</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70 italic">
                {posts.length} annonce(s) en ligne
              </p>
            </div>
          </div>
          <Sparkles className="size-8 text-primary/20 animate-pulse hidden md:block" />
        </div>
      </div>

      {/* LISTE DES ARTICLES */}
      <div className="grid gap-4 px-2 md:px-0">
        {posts.map((post) => (
          <Card key={post.id} className="group overflow-hidden border-none shadow-xl shadow-black/[0.03] bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 rounded-[2rem]">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start md:items-center gap-4">
                
                {/* IMAGE AVEC BADGE */}
                {post.attachments[0] && (
                  <div className="relative size-24 md:size-28 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-lg border-2 border-background">
                    <Image 
                      src={post.attachments[0].url} 
                      alt="Product" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                )}

                {/* CONTENU & INFOS */}
                <div className="flex-1 min-w-0 py-1">
                  {editingId === post.id ? (
                    <div className="space-y-3">
                      <Textarea 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm rounded-2xl bg-muted/50 border-none focus-visible:ring-primary shadow-inner"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(post.id)} disabled={isLoading} className="rounded-xl px-4 bg-primary font-bold">
                          {isLoading ? <Loader2 className="animate-spin size-3" /> : <Check className="size-3 mr-2" />} Enregistrer
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between gap-2">
                      <div>
                        <p className="font-black text-base md:text-lg tracking-tight line-clamp-2 leading-tight">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-black uppercase italic">
                            <Heart className="size-3 fill-rose-500" /> {post._count.likes}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase italic">
                            <MessageSquare className="size-3 fill-primary" /> {post._count.comments}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTIONS - Vertical sur PC, Horizontal sur Mobile */}
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 self-center md:self-auto bg-muted/30 p-1 rounded-2xl md:bg-transparent">
                  <Button 
                    variant="ghost" size="icon" 
                    className="rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Remonter l'annonce"
                    onClick={() => handleRepublish(post)}
                  >
                    <RefreshCw className={`size-5 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>

                  <Button 
                    variant="ghost" size="icon" 
                    className="rounded-xl text-foreground/70 hover:bg-background transition-colors"
                    onClick={() => { setEditingId(post.id); setEditContent(post.content); }}
                  >
                    <Pencil className="size-5" />
                  </Button>

                  <Button 
                    variant="ghost" size="icon" 
                    className="rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? <Loader2 className="animate-spin size-5" /> : <Trash2 className="size-5" />}
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}