"use client";

import { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {MyCustomSwitch} from "@/components/ui/MyCustomSwitch"; // Assure-toi d'avoir fait: npx shadcn@latest add switch
import { Trash2, Store, Bell, ShieldAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateShopSettings, deleteSellerAccount, toggleNotifications } from "./actions";
import { useRouter } from "next/navigation";

export default function SellerSettingsPage({ user }: { user: UserData }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingNotifs, setIsTogglingNotifs] = useState(false);
  const router = useRouter();

  // 1. GESTION DES INFOS BOUTIQUE
  async function handleSave(formData: FormData) {
    setIsUpdating(true);
    try {
      const displayName = formData.get("shopName") as string;
      const bio = formData.get("bio") as string;
      await updateShopSettings({ displayName, bio }); 
      alert("Profil mis à jour !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  }

  // 2. GESTION DES NOTIFICATIONS (Activation/Désactivation)
  async function handleNotifChange(checked: boolean) {
    setIsTogglingNotifs(true);
    try {
      await toggleNotifications(checked);
    } catch (e) {
      alert("Erreur lors de la modification des notifications");
    } finally {
      setIsTogglingNotifs(false);
    }
  }

  // 3. SUPPRESSION DU COMPTE
  async function handleDelete() {
    if (!confirm("Es-tu certain ? Tous tes articles seront supprimés et tu perdras ton accès vendeur.")) return;
    
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
    <div className="max-w-3xl mx-auto space-y-8 pb-10 px-2">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Paramètres Boutique</h1>

      {/* SECTION 1 : PROFIL PUBLIC */}
      <form action={handleSave}>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="size-5 text-primary" /> Profil Public
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Nom de la boutique</Label>
              <Input name="shopName" id="shopName" defaultValue={user.displayName} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Description</Label>
              <Textarea name="bio" id="bio" defaultValue={user.bio || ""} className="rounded-xl min-h-[100px]" />
            </div>
            <Button type="submit" disabled={isUpdating} className="w-full md:w-fit rounded-xl px-8 font-bold">
              {isUpdating ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* SECTION 2 : NOTIFICATIONS (Nouveau !) */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="size-5 text-primary" /> Notifications de vente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Alertes de nouveaux messages</p>
              <p className="text-xs text-muted-foreground">Recevoir un push pour chaque client.</p>
            </div>
            <MyCustomSwitch 
              checked={user.allowNotifications} // Assure-toi que allowNotifications existe dans ton type UserData
              onCheckedChange={handleNotifChange}
              disabled={isTogglingNotifs}
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3 : ZONE DE DANGER */}
      <Card className="border-2 border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-5" /> Zone Critique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/50 rounded-xl border border-destructive/10">
            <div className="text-center md:text-left">
              <p className="text-sm font-black uppercase text-destructive">Fermer mon compte Vendeur</p>
              <p className="text-[11px] text-muted-foreground">Action irréversible.</p>
            </div>
            <Button 
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive" 
              className="rounded-xl gap-2 font-black"
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : <Trash2 className="size-4" />}
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}