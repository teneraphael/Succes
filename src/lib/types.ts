import { Prisma } from "@prisma/client";

/**
 * Définit la sélection des champs pour les objets User.
 * Inclut le comptage des relations et l'état de suivi par l'utilisateur connecté.
 */
export function getUserDataSelect(loggedInUserId?: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    coverUrl: true,
    bio: true,
    isSeller: true,
    isPioneer: true,
    tiktokUrl: true,
    instagramUrl: true,
    whatsappUrl: true,
    phoneNumber: true,
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
        sales: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

/**
 * Définit les relations incluses pour les objets Post.
 * Assurez-vous que 'attributes' et 'variants' existent dans votre schema.prisma.
 */
export function getPostDataInclude(loggedInUserId?: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    attributes: true, // Doit correspondre à la relation dans schema.prisma
    variants: true,   // Doit correspondre à la relation dans schema.prisma
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

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

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