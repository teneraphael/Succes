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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, User, FileText } from "lucide-react";
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
      { values, avatar: newAvatarFile, cover: newCoverFile },
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
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh] p-0 rounded-3xl border border-border/60 shadow-xl gap-0">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
              <User className="size-4 text-[#4a90e2]" />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-tight text-foreground">
              Modifier le profil
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">

          {/* Bannière */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Image de couverture
            </p>
            <CoverInput
              src={
                croppedCover
                  ? URL.createObjectURL(croppedCover)
                  : (user as any).coverUrl || null
              }
              onImageCropped={setCroppedCover}
            />
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Photo de profil
            </p>
            <AvatarInput
              src={
                croppedAvatar
                  ? URL.createObjectURL(croppedAvatar)
                  : user.avatarUrl || avatarPlaceholder
              }
              onImageCropped={setCroppedAvatar}
            />
          </div>

          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 ml-1">
                        <User className="size-3 text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Nom affiché
                        </p>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Votre nom affiché"
                          {...field}
                          className="h-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-sm font-semibold transition-all"
                        />
                      </FormControl>
                      <FormMessage className="ml-1 text-[10px] font-black uppercase tracking-widest" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 ml-1">
                        <FileText className="size-3 text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Bio
                        </p>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Parlez un peu de vous..."
                          className="resize-none rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-sm font-semibold transition-all min-h-[100px]"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="ml-1 text-[10px] font-black uppercase tracking-widest" />
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <LoadingButton
                  type="submit"
                  loading={mutation.isPending}
                  className="w-full h-12 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-2xl font-black uppercase italic tracking-tight text-sm shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.97]"
                >
                  Sauvegarder
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Avatar Input
interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;
    Resizer.imageFileResizer(image, 1024, 1024, "WEBP", 100, 0,
      (uri) => setImageToCrop(uri as File), "file");
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
          width={80}
          height={80}
          className="size-20 rounded-full object-cover ring-2 ring-[#4a90e2]/20 ring-offset-2 ring-offset-background"
        />
        <span className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Camera size={16} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </>
  );
}

// Cover Input
interface CoverInputProps {
  src: string | null;
  onImageCropped: (blob: Blob | null) => void;
}

function CoverInput({ src, onImageCropped }: CoverInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;
    Resizer.imageFileResizer(image, 1920, 600, "WEBP", 90, 0,
      (uri) => setImageToCrop(uri as File), "file");
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
        className="group relative w-full h-28 rounded-2xl border-2 border-dashed border-[#4a90e2]/20 hover:border-[#4a90e2]/40 bg-[#4a90e2]/5 overflow-hidden transition-all flex items-center justify-center"
      >
        {src ? (
          <Image
            src={src}
            alt="Bannière preview"
            fill
            className="object-cover group-hover:opacity-80 transition-opacity"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-[#4a90e2]/50">
            <Camera size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Ajouter une couverture
            </span>
          </div>
        )}

        {src && (
          <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            <Camera size={20} />
          </span>
        )}
      </button>

      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={16 / 5}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </>
  );
}