"use client";

import { PostData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2, MessageSquare, Heart, Loader2,
  Pencil, RefreshCw, Check, ArrowLeft, Package, Sparkles
} from "lucide-react";
import { deletePost, updatePost } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

export default function MyPostsClient({ posts }: { posts: PostData[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleDelete(id: string) {
    if (!confirm(t.delete_comment_desc)) return;
    setDeletingId(id);
    try {
      await deletePost(id);
    } catch {
      alert(t.error_loading);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRepublish(post: PostData) {
    setIsLoading(true);
    try {
      await updatePost(post.id, post.content, true);
    } catch {
      alert(t.error_loading);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setIsLoading(true);
    try {
      await updatePost(id, editContent, false);
      setEditingId(null);
    } catch {
      alert(t.error_loading);
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ État vide — style DealCity
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-5">
        <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
          <Package className="size-7 text-[#4a90e2]" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-black uppercase tracking-tight text-foreground">
            {t.no_products}
          </p>
          <p className="text-xs text-muted-foreground font-medium max-w-[240px] leading-relaxed">
            {t.no_products_desc}
          </p>
        </div>
        <Link
          href="/post/new"
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#6ab344] hover:bg-[#5a9a38] text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-[#6ab344]/20 transition-all active:scale-95"
        >
          {t.publish_product}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">

      {/* ✅ Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4a90e2]/10 via-transparent to-transparent p-6 md:rounded-3xl border-b md:border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-background/50 border border-border hover:border-[#4a90e2]/30 transition-all sm:hidden"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                Mes <span className="text-[#4a90e2]">Articles</span>
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70 italic">
                {posts.length} annonce(s) en ligne
              </p>
            </div>
          </div>
          <Sparkles className="size-8 text-[#4a90e2]/20 animate-pulse hidden md:block" />
        </div>
      </div>

      {/* ✅ Liste des articles */}
      <div className="grid gap-4 px-2 md:px-0">
        {posts.map((post) => (
          <Card key={post.id} className="group overflow-hidden border-none shadow-xl shadow-black/[0.03] bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 rounded-[2rem]">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start md:items-center gap-4">

                {/* Image produit */}
                {post.attachments[0] && (
                  <div className="relative size-24 md:size-28 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-lg border-2 border-background">
                    <Image
                      src={post.attachments[0].url}
                      alt="Product"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized={isExternalImage(post.attachments[0].url)}
                    />
                  </div>
                )}

                {/* Contenu */}
                <div className="flex-1 min-w-0 py-1">
                  {editingId === post.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm rounded-2xl bg-muted/50 border-none focus-visible:ring-[#4a90e2] shadow-inner"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4a90e2] hover:bg-[#357abd] text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isLoading
                            ? <Loader2 className="animate-spin size-3" />
                            : <Check className="size-3" />
                          }
                          {t.save}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-black uppercase tracking-widest transition-all"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between gap-2">
                      <div>
                        <p className="font-black text-base md:text-lg tracking-tight line-clamp-2 leading-tight text-foreground">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-black uppercase italic">
                            <Heart className="size-3 fill-rose-500" /> {post._count.likes}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4a90e2]/10 text-[#4a90e2] text-[11px] font-black uppercase italic">
                            <MessageSquare className="size-3" /> {post._count.comments}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Actions — boutons sans Button shadcn */}
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 self-center bg-muted/30 p-1 rounded-2xl md:bg-transparent">
                  {/* Remonter */}
                  <button
                    onClick={() => handleRepublish(post)}
                    title="Remonter l'annonce"
                    className="p-2 rounded-xl text-[#4a90e2] hover:bg-[#4a90e2]/10 transition-all active:scale-90"
                  >
                    <RefreshCw className={`size-5 ${isLoading ? "animate-spin" : ""}`} />
                  </button>

                  {/* Modifier */}
                  <button
                    onClick={() => { setEditingId(post.id); setEditContent(post.content); }}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all active:scale-90"
                  >
                    <Pencil className="size-5" />
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all active:scale-90 disabled:opacity-50"
                  >
                    {deletingId === post.id
                      ? <Loader2 className="animate-spin size-5" />
                      : <Trash2 className="size-5" />
                    }
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}