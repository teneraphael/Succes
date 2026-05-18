import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import CropImageDialog from "@/components/CropImageDialog";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { useUpdateProfileMutation } from "./mutations";

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
    },
  });

  const mutation = useUpdateProfileMutation();

  // États locaux pour stocker les blobs finaux après recadrage
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);

  async function onSubmit(values: UpdateUserProfileValues) {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`, { type: "image/webp" })
      : undefined;

    const newCoverFile = croppedCover
      ? new File([croppedCover], `cover_${user.id}.webp`, { type: "image/webp" })
      : undefined;

    mutation.mutate(
      {
        values,
        avatar: newAvatarFile,
        cover: newCoverFile, // Transmis à ta mutation qui gère l'upload de la bannière
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          setCroppedCover(null);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh] p-6 rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        {/* SECTION DES DEUX COMPOSANTS DE CONFIGURATION VISUELLE */}
        <div className="space-y-6 my-2">
          {/* 1. Zone Image de Couverture / Bannière */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600">Bannière de couverture</Label>
            <CoverInput
              src={
                croppedCover
                  ? URL.createObjectURL(croppedCover)
                  : (user as any).coverUrl || null
              }
              onImageCropped={setCroppedCover}
            />
          </div>

          {/* 2. Zone Photo de Profil (Avatar) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600">Avatar</Label>
            <AvatarInput
              src={
                croppedAvatar
                  ? URL.createObjectURL(croppedAvatar)
                  : user.avatarUrl || avatarPlaceholder
              }
              onImageCropped={setCroppedAvatar}
            />
          </div>
        </div>

        {/* FORMULAIRE DES CHAMPS TEXTE */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none rounded-xl"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <LoadingButton type="submit" loading={mutation.isPending} className="w-full sm:w-auto px-6 rounded-xl">
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// COMPOSANT D'INPUT POUR L'AVATAR (INCHANGÉ)
// ==========================================
interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={100}
          height={100}
          className="size-24 flex-none rounded-full object-cover border border-slate-200 shadow-sm"
        />
        <span className="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Camera size={20} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}

// ==========================================
// GESTIONNAIRE D'INPUT POUR LA BANNIÈRE (NOUVEAU)
// ==========================================
interface CoverInputProps {
  src: string | null;
  onImageCropped: (blob: Blob | null) => void;
}

function CoverInput({ src, onImageCropped }: CoverInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    // Compression et conversion fluide de la bannière en WebP haute définition
    Resizer.imageFileResizer(
      image,
      1920,
      600,
      "WEBP",
      90,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative w-full h-32 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden shadow-sm flex items-center justify-center"
      >
        {src ? (
          <Image
            src={src}
            alt="Bannière preview"
            fill
            className="object-cover group-hover:opacity-80 transition-opacity duration-200"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Camera size={24} className="opacity-70" />
            <span className="text-[11px] font-semibold">Ajouter une image de couverture</span>
          </div>
        )}
        
        {/* Voile d'interaction au survol si une image existe */}
        {src && (
          <span className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera size={22} />
          </span>
        )}
      </button>

      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={16 / 5} // Ratio panoramique calibré pour une bannière impeccable
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}