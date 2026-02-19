import { Prisma } from "@prisma/client";

// --- NOUVELLE INTERFACE POUR LES FILTRES STUDIO ---
export interface MediaSettings {
  brightness: number;
  contrast: number;
  saturate: number;
}

export function getUserDataSelect(loggedInUserId?: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    isSeller: true,
    isPioneer: true,
    tiktokUrl: true,
    instagramUrl: true,
    whatsappUrl: true,
    isVerified: true,
    allowNotifications: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId || "ANONYMOUS_USER",
      },
      select: {
        followerId: true,
        followingId: true, 
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId?: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    // ✅ On inclut les attachments
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId || "ANONYMOUS_USER",
      },
      select: {
        userId: true,
        postId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId || "ANONYMOUS_USER",
      },
      select: {
        id: true, 
        userId: true,
        postId: true,
        createdAt: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

// ✅ Type enrichi pour inclure les réglages de média
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}> & {
  attachments: Array<{
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO" | "AUDIO";
    settings?: MediaSettings | any; // Permet de stocker les filtres JSON
  }>
};

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId?: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}