const API_URL = "https://dealcity.app/api";

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

export type DealCityMedia = {
  id: string;
  type: MediaType;
  url: string;
  settings?: unknown;
};

export type DealCityUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  isSeller?: boolean;
  isPioneer?: boolean;
  isVerified?: boolean;
  phoneNumber?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  businessName?: string | null;
  businessDomain?: string | null;
  followers?: unknown[];
  _count?: {
    posts?: number;
    followers?: number;
    sales?: number;
  };
};

export type DealCityPost = {
  id: string;
  content: string;
  userId: string;
  user: DealCityUser;
  attachments: DealCityMedia[];
  category?: string;
  views?: number;
  thumbnailUrl?: string | null;
  stock?: number;
  price?: number;
  city?: string | null;
  neighborhood?: string | null;
  createdAt: string;
  likes?: unknown[];
  bookmarks?: unknown[];
  _count?: {
    likes?: number;
    comments?: number;
    orders?: number;
  };
};

export type PostsPage = {
  posts: DealCityPost[];
  nextCursor: string | null;
};

export type Shop = DealCityUser & {
  posts?: Array<{
    id: string;
    content: string;
    thumbnailUrl?: string | null;
    attachments?: Array<Pick<DealCityMedia, "url" | "type">>;
  }>;
};

export type SearchResult = {
  posts: DealCityPost[];
  users: DealCityUser[];
  nextCursor: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function withQuery(
  endpoint: string,
  params?: Record<string, string | number | null | undefined>,
) {
  if (!params) return endpoint;

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  return query ? `${endpoint}?${query}` : endpoint;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const raw = await response.text();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `Erreur DealCity (${response.status})`;
    throw new ApiError(String(message), response.status);
  }

  return data as T;
}

export const api = {
  posts: {
    getForYou: (params?: { cursor?: string | null; city?: string; neighborhood?: string }) =>
      fetchApi<PostsPage>(withQuery("/posts/for-you", params)),

    getFollowing: (cursor?: string | null) =>
      fetchApi<PostsPage>(withQuery("/posts/following", { cursor })),

    getBookmarked: (cursor?: string | null) =>
      fetchApi<PostsPage>(withQuery("/posts/bookmarked", { cursor })),

    getVideos: (cursor?: string | null) =>
      fetchApi<PostsPage>(withQuery("/posts/videos", { cursor })),

    create: (payload: {
      content: string;
      city?: string;
      neighborhood?: string;
      mediaIds?: string[];
      stock?: number;
      targetUserId?: string;
    }) =>
      fetchApi<DealCityPost>("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    toggleLike: (postId: string) =>
      fetchApi(`/posts/${postId}/likes`, { method: "POST" }),

    toggleBookmark: (postId: string) =>
      fetchApi(`/posts/${postId}/bookmark`, { method: "POST" }),

    report: (postId: string) =>
      fetchApi(`/posts/${postId}/report`, { method: "POST" }),

    getComments: (postId: string) =>
      fetchApi(`/posts/${postId}/comments`),

    addComment: (postId: string, content: string) =>
      fetchApi(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  shops: {
    getAll: () => fetchApi<Shop[]>("/shops"),
  },

  search: {
    query: (keyword: string, cursor?: string | null) =>
      fetchApi<SearchResult>(
        withQuery("/search", {
          q: keyword.trim(),
          cursor,
        }),
      ),
  },

  notifications: {
    getAll: () => fetchApi("/notifications"),
    getUnreadCount: () => fetchApi<{ unreadCount: number }>("/notifications/unread-count"),
    markAsRead: () =>
      fetchApi("/notifications/mark-as-read", { method: "POST" }),
  },

  users: {
    getFollowers: (userId: string) =>
      fetchApi(`/users/${userId}/followers`),
    getOrders: (userId: string) =>
      fetchApi(`/users/${userId}/orders`),
  },

  analytics: {
    track: (eventData: unknown) =>
      fetchApi("/analytics/track", {
        method: "POST",
        body: JSON.stringify(eventData),
      }),
  },
};

export { API_URL };
