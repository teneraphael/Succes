"use client";

import { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MyCustomSwitch } from "@/components/ui/MyCustomSwitch";
import { Trash2, Store, Bell, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
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
      alert("Profil mis à jour !");
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
    if (!confirm("Es-tu certain ? Action irréversible.")) return;
    setIsDeleting(true);
    try {
      await deleteSellerAccount();
      router.push("/");
      router.refresh();
    } catch (e) {
      alert("Erreur");
      setIsDeleting(false);
    }
  }

  return (
    /* w-full pour occuper tout l'écran sur mobile, max-w-3xl uniquement sur PC */
    <div className="w-full md:max-w-3xl mx-auto space-y-4 md:space-y-8 pb-10 px-0 md:px-4">
      
      {/* HEADER MOBILE : Collé aux bords avec un léger padding horizontal */}
      <div className="flex items-center gap-3 md:hidden pt-4 px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="rounded-full bg-muted/50"
        >
          <ArrowLeft className="size-6" />
        </Button>
        <span className="font-bold text-lg">Paramètres</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-primary px-4 md:px-0 md:pt-6">
        Paramètres Boutique
      </h1>

      {/* SECTION 1 : PROFIL PUBLIC - Bord à bord sur mobile */}
      <form action={handleSave}>
        <Card className="border-x-0 border-t-0 border-b md:border shadow-none md:shadow-sm rounded-none md:rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 px-4 md:px-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Store className="size-5 text-primary" /> Profil Public
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-4 md:px-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Nom de la boutique</Label>
              <Input 
                name="shopName" 
                id="shopName" 
                defaultValue={user.displayName} 
                required 
                className="rounded-xl h-12 md:h-10 text-base shadow-inner bg-muted/10" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Description</Label>
              <Textarea 
                name="bio" 
                id="bio" 
                defaultValue={user.bio || ""} 
                className="rounded-xl min-h-[120px] text-base shadow-inner bg-muted/10" 
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating} 
              className="w-full md:w-fit rounded-xl px-8 font-bold h-12 md:h-10 shadow-lg shadow-primary/20"
            >
              {isUpdating && <Loader2 className="animate-spin size-4 mr-2" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* SECTION 2 : NOTIFICATIONS - Bord à bord sur mobile */}
      <Card className="border-x-0 border-y md:border shadow-none md:shadow-sm rounded-none md:rounded-2xl">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Bell className="size-5 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Ventes & Messages</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold italic">Recevoir un push client</p>
            </div>
            <MyCustomSwitch 
              checked={user.allowNotifications} 
              onCheckedChange={handleNotifChange}
              disabled={isTogglingNotifs}
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3 : ZONE DE DANGER - Légèrement décollée pour l'alerte visuelle */}
      <div className="px-3 md:px-0">
        <Card className="border-2 border-destructive/20 bg-destructive/5 rounded-3xl overflow-hidden">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" /> Zone Critique
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-6">
            <div className="flex flex-col gap-4 p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-destructive/10">
              <div className="text-center md:text-left">
                <p className="text-sm font-black uppercase text-destructive tracking-tight">Désactiver le mode vendeur</p>
                <p className="text-[11px] text-muted-foreground font-medium">Tes articles ne seront plus visibles publiquement.</p>
              </div>
              <Button 
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive" 
                className="rounded-xl gap-2 font-black w-full h-12 shadow-lg shadow-destructive/20"
              >
                {isDeleting ? <Loader2 className="animate-spin size-4" /> : <Trash2 className="size-4" />}
                Supprimer mon accès
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}