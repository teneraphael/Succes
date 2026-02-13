"use client";

import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import UserAvatar from "@/components/UserAvatar";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, SearchIcon, X, Users } from "lucide-react";
import { useState } from "react";
import { UserResponse } from "stream-chat";
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { cn } from "@/lib/utils";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext();
  const { toast } = useToast();
  const { user: loggedInUser } = useSession();

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput);

  const [selectedUsers, setSelectedUsers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([]);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () =>
      client.queryUsers(
        {
          id: { $ne: loggedInUser.id },
          role: { $ne: "admin" },
          ...(searchInputDebounced
            ? {
                $or: [
                  { name: { $autocomplete: searchInputDebounced } },
                  { username: { $autocomplete: searchInputDebounced } },
                ],
              }
            : {}),
        },
        { name: 1, username: 1 },
        { limit: 15 },
      ),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel("messaging", {
        members: [loggedInUser.id, ...selectedUsers.map((u) => u.id)],
        name:
          selectedUsers.length > 1
            ? loggedInUser.displayName +
              ", " +
              selectedUsers.map((u) => u.name).join(", ")
            : undefined,
      });
      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },
    onError(error) {
      console.error("Error starting chat", error);
      toast({
        variant: "destructive",
        description: "Error starting chat. Please try again.",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border-white/10 bg-background/80 p-0 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="size-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Nouvelle discussion</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-2">
          {/* Barre de recherche stylisée */}
          <div className="group relative mt-2">
            <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              placeholder="Rechercher un utilisateur..."
              className="h-11 w-full rounded-xl border border-border/50 bg-muted/30 pe-4 ps-11 text-sm outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/5"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Tags des utilisateurs sélectionnés */}
          <div className="min-h-[50px] py-3">
             <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <SelectedUserTag
                    key={user.id}
                    user={user}
                    onRemove={() => {
                      setSelectedUsers((prev) =>
                        prev.filter((u) => u.id !== user.id),
                      );
                    }}
                  />
                ))}
             </div>
          </div>
        </div>

        <div className="relative h-80 overflow-y-auto border-t border-border/40 bg-muted/10 px-2">
          {isSuccess &&
            data.users.map((user) => (
              <UserResult
                key={user.id}
                user={user}
                selected={selectedUsers.some((u) => u.id === user.id)}
                onClick={() => {
                  setSelectedUsers((prev) =>
                    prev.some((u) => u.id === user.id)
                      ? prev.filter((u) => u.id !== user.id)
                      : [...prev, user],
                  );
                }}
              />
            ))}
          
          {isSuccess && !data.users.length && (
            <div className="flex h-full flex-col items-center justify-center py-10">
              <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé.</p>
            </div>
          )}
          
          {isFetching && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 bg-background/50 p-6 backdrop-blur-md">
          <LoadingButton
            className="w-full rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Lancer la conversation
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 hover:bg-primary/5",
        selected && "bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <UserAvatar avatarUrl={user.image} size={44} />
          {selected && (
            <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check className="size-3 stroke-[3px]" />
            </div>
          )}
        </div>
        <div className="flex flex-col text-start">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>
    </button>
  );
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
  return (
    <span
      className="flex animate-in zoom-in-95 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 py-1 pl-1 pr-2 text-xs font-medium text-primary"
    >
      <UserAvatar avatarUrl={user.image} size={20} />
      {user.name}
      <button 
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}