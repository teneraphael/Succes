"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { MoreHorizontal, Trash2, ShieldAlert, Download, Copy, Share2, ExternalLink, Loader2, Store, MessageCircle, Instagram, Music2 } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import DeletePostDialog from "./DeletePostDialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({ post, className }: PostMoreButtonProps) {
  const { user: currentUser } = useSession();
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  if (!currentUser) return null;

  const socialLink = post.user.tiktokUrl || post.user.instagramUrl || post.user.whatsappUrl;

  const getSocialInfo = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes("tiktok.com")) return { label: "TikTok", icon: <Music2 className="size-4 text-[#ff0050]" />, color: "text-[#ff0050]" };
    if (lower.includes("instagram.com")) return { label: "Instagram", icon: <Instagram className="size-4 text-[#e1306c]" />, color: "text-[#e1306c]" };
    if (lower.includes("wa.me") || lower.includes("whatsapp.com")) return { label: "WhatsApp", icon: <MessageCircle className="size-4 text-[#25d366]" />, color: "text-[#25d366]" };
    return { label: t.seller_dashboard, icon: <Store className="size-4 text-[#4a90e2]" />, color: "text-[#4a90e2]" };
  };

  const socialInfo = socialLink ? getSocialInfo(socialLink) : null;
  const isOwner = post.user.id === currentUser.id;
  const itemCls = "flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold text-foreground hover:bg-muted transition-all";

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.origin + "/posts/" + post.id);
    toast({ description: t.link_copied });
  }

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title: "DealCity", text: post.content, url: window.location.origin + "/posts/" + post.id }); }
      catch { copyLink(); }
    } else { copyLink(); }
  }

  async function downloadMedia() {
    if (!post.attachments.length) return;
    toast({ description: t.download_started });
    for (const [i, media] of post.attachments.entries()) {
      try {
        const res = await fetch(media.url + "?t=" + Date.now());
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dealcity_" + post.user.username + "_" + (i + 1) + (media.type === "VIDEO" ? ".mp4" : ".jpg");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch {
        toast({ variant: "destructive", description: t.download_error });
      }
    }
  }

  async function handleReport() {
    if (isReporting) return;
    setIsReporting(true);
    try {
      const res = await fetch("/api/posts/" + post.id + "/report", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      toast({ description: data.message, variant: data.message.includes("supprime") ? "destructive" : "default" });
      if (data.message.includes("supprime")) router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message });
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={"p-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all active:scale-90 outline-none " + (className ?? "")}>
          <MoreHorizontal className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-xl border border-border/60 rounded-2xl bg-card">
        {socialLink && socialInfo && (
          <DropdownMenuItem asChild>
            <a href={socialLink.startsWith("http") ? socialLink : "https://" + socialLink} target="_blank" rel="noopener noreferrer" className={"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer font-black italic text-xs uppercase tracking-widest transition-all hover:bg-muted " + socialInfo.color}>
              {socialInfo.icon}
              {socialInfo.label}
            </a>
          </DropdownMenuItem>
        )}
        {socialLink && <DropdownMenuSeparator className="my-1 bg-border/40" />}
        <DropdownMenuItem onClick={handleShare} className={itemCls}>
          <Share2 className="size-4 text-muted-foreground" />
          {t.share}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className={itemCls}>
          <Copy className="size-4 text-muted-foreground" />
          {t.copy_link}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={"/posts/" + post.id} target="_blank" rel="noopener noreferrer" className={itemCls}>
            <ExternalLink className="size-4 text-muted-foreground" />
            {t.fullscreen}
          </a>
        </DropdownMenuItem>
        {post.attachments.length > 0 && (
          <DropdownMenuItem onClick={downloadMedia} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all">
            <Download className="size-4" />
            {t.download}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-1 bg-border/40" />
        {isOwner ? (
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-black text-red-500 hover:bg-red-500/8 transition-all">
            <Trash2 className="size-4" />
            {t.delete_post}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleReport} disabled={isReporting} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-black text-amber-500 hover:bg-amber-500/8 transition-all disabled:opacity-50">
            {isReporting ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
            {isReporting ? t.verifying : t.report}
          </DropdownMenuItem>
        )}
        <DeletePostDialog post={post} open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}