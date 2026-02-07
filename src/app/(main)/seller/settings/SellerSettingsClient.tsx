"use client";

import { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MyCustomSwitch } from "@/components/ui/MyCustomSwitch";
import { Trash2, Store, Bell, ShieldAlert, Loader2, ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { updateShopSettings, deleteSellerAccount, toggleNotifications } from "./actions";
import { useRouter } from "next/navigation";

export default function SellerSettingsPage({ user }: { user: UserData }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingNotifs, setIsTogglingNotifs] = useState(false);
  const router = useRouter();

  async function handleSave(formData: FormData) {
    setIsUpdating(true);
    try {
      const displayName = formData.get("shopName") as string;
      const bio = formData.get("bio") as string;
      await updateShopSettings({ displayName, bio }); 
      alert("Profil mis à jour ! ✨");
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleNotifChange(checked: boolean) {
    setIsTogglingNotifs(true);
    try {
      await toggleNotifications(checked);
    } catch (e) {
      alert("Erreur");
    } finally {
      setIsTogglingNotifs(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Cette action est irréversible. Continuer ?")) return;
    setIsDeleting(true);
    try {
      await deleteSellerAccount();
      router.push("/");
      router.refresh();
    } catch (e) {
      alert("Erreur lors de la suppression");
      setIsDeleting(false);
    }
  }

  return (
    /* Le conteneur principal doit être en flux normal (pas de sticky ici) */
    <div className="w-full md:max-w-4xl mx-auto space-y-6 pb-20 px-0 md:px-4">
      
      {/* HEADER : Supprimé le 'sticky' s'il y en avait un. Il doit être 'relative' ou statique */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 md:rounded-3xl md:mt-6 border-b md:border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                Réglages <span className="text-primary">Boutique</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
                Gérez votre identité vendeur
              </p>
            </div>
          </div>
          <Sparkles className="size-10 text-primary/20 animate-pulse hidden md:block" />
        </div>
      </div>

      {/* CONTENU : Les cartes scrollent maintenant avec la page */}
      <div className="space-y-6">
        {/* SECTION 1 : PROFIL PUBLIC */}
        <form action={handleSave}>
          <Card className="border-x-0 md:border shadow-none md:shadow-xl md:shadow-primary/5 bg-transparent md:bg-card rounded-none md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-6 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Store className="size-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Identité Visuelle</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8">
              <div className="space-y-2 group">
                <Label htmlFor="shopName" className="text-xs font-black uppercase ml-1 text-muted-foreground group-focus-within:text-primary transition-colors">Nom de votre univers</Label>
                <Input 
                  name="shopName" 
                  id="shopName" 
                  defaultValue={user.displayName} 
                  required 
                  className="rounded-2xl h-14 text-base border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-muted/5 shadow-inner" 
                />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="bio" className="text-xs font-black uppercase ml-1 text-muted-foreground group-focus-within:text-primary transition-colors">Votre histoire (Bio)</Label>
                <Textarea 
                  name="bio" 
                  id="bio" 
                  defaultValue={user.bio || ""} 
                  placeholder="Racontez ce qui rend votre boutique unique..."
                  className="rounded-2xl min-h-[140px] text-base border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-muted/5 shadow-inner resize-none" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUpdating} 
                className="w-full md:w-fit rounded-2xl px-10 font-black h-14 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
              >
                {isUpdating ? <Loader2 className="animate-spin size-5 mr-2" /> : <ChevronRight className="size-5 mr-2" />}
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* SECTION 2 : NOTIFICATIONS */}
        <Card className="mx-0 md:mx-0 border-x-0 md:border shadow-none md:shadow-xl md:shadow-black/5 bg-card rounded-none md:rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Bell className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Alertes de vente</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Notifications push clients</p>
                </div>
              </div>
              <MyCustomSwitch 
                checked={user.allowNotifications} 
                onCheckedChange={handleNotifChange}
                disabled={isTogglingNotifs}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3 : ZONE DE DANGER */}
        <div className="px-4 md:px-0">
          <Card className="border-2 border-destructive/20 bg-destructive/[0.02] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-6" />
                </div>
                <CardTitle className="text-xl font-bold text-destructive tracking-tight">Espace Critique</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <div className="p-5 bg-background rounded-3xl border border-destructive/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm font-black uppercase text-foreground">Quitter le programme vendeur</p>
                  <p className="text-xs text-muted-foreground font-medium">Tes articles ne seront plus visibles publiquement.</p>
                </div>
                <Button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive" 
                  className="rounded-xl px-6 h-12 font-black transition-all gap-2 w-full md:w-auto shadow-lg shadow-destructive/20"
                >
                  {isDeleting ? <Loader2 className="animate-spin size-4" /> : <Trash2 className="size-4" />}
                  Désactiver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}