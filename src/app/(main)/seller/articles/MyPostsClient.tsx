"use client";

import { PostData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Heart, Eye, Loader2, Pencil, RefreshCw, X, Check } from "lucide-react";
import { deletePost, updatePost } from "./actions"; // Importe updatePost
import { useState } from "react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

export default function MyPostsClient({ posts }: { posts: PostData[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // SUPPRIMER
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

  // REPUBLIER (Remonter en haut)
  async function handleRepublish(post: PostData) {
    setIsLoading(true);
    try {
      await updatePost(post.id, post.content, true);
      alert("Article remonté en haut de liste !");
    } catch (e) {
      alert("Erreur lors de la republication");
    } finally {
      setIsLoading(false);
    }
  }

  // MODIFIER LE TEXTE
  async function handleSaveEdit(id: string) {
    setIsLoading(true);
    try {
      await updatePost(id, editContent, false);
      setEditingId(null);
    } catch (e) {
      alert("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Tu n&apos;as pas encore d&apos;articles en vente.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col p-4 gap-4">
              <div className="flex items-center gap-4">
                {/* Image */}
                {post.attachments[0] && (
                  <div className="relative size-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={post.attachments[0].url} alt="Product" fill className="object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {editingId === post.id ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm rounded-xl"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(post.id)} disabled={isLoading} className="rounded-lg h-8">
                          {isLoading ? <Loader2 className="animate-spin size-3" /> : <Check className="size-3 mr-1" />} Sauvegarder
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-lg h-8">Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold truncate">{post.content}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="size-3" /> {post._count.likes}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {post._count.comments}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* BOUTON REPUBLIER */}
                  <Button 
                    variant="ghost" size="icon" className="rounded-full text-blue-500 hover:bg-blue-50"
                    onClick={() => handleRepublish(post)}
                    title="Republier (Remonter en haut)"
                  >
                    <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>

                  {/* BOUTON MODIFIER */}
                  <Button 
                    variant="ghost" size="icon" className="rounded-full"
                    onClick={() => { setEditingId(post.id); setEditContent(post.content); }}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  {/* BOUTON SUPPRIMER */}
                  <Button 
                    variant="ghost" size="icon" 
                    className="rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? <Loader2 className="animate-spin size-4" /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}