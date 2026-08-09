import { Platform } from "react-native";

// Remplace cette URL par ton adresse IP locale en dev (ex: http://192.168.1.15:3000/api) ou ton URL de production
const API_URL = 'https://api.dealcity.app/v1';

// ================= 1. CLIENT GÉNÉRIQUE =================
async function fetchApi(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Une erreur est survenue lors de la requête");
    }
    return data;
  } catch (error) {
    console.error(`Erreur API [${endpoint}] :`, error);
    throw error;
  }
}

// ================= 2. FONCTIONS DE BASE (Rétrocompatibilité) =================
export async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des posts :", error);
    return [];
  }
}

export async function createPost(postData: { title: string; price: string; location: string; description: string }) {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur de création");
    return data;
  } catch (error) {
    console.error("Erreur lors de la création du post :", error);
    throw error;
  }
}

// ================= 3. STRUCTURE GLOBALE DE TOUTES LES TABLES =================
export const api = {
  // --- Posts & Interactions ---
  posts: {
    getAll: fetchPosts,
    create: createPost,
    getForYou: () => fetchApi('/posts/for-you'),
    getFollowing: () => fetchApi('/posts/following'),
    getBookmarked: () => fetchApi('/posts/bookmarked'),
    getVideos: () => fetchApi('/posts/videos'),
    
    toggleLike: (postId: string) => fetchApi(`/posts/${postId}/likes`, { method: 'POST' }),
    toggleBookmark: (postId: string) => fetchApi(`/posts/${postId}/bookmark`, { method: 'POST' }),
    report: (postId: string) => fetchApi(`/posts/${postId}/report`, { method: 'POST' }),
    
    getComments: (postId: string) => fetchApi(`/posts/${postId}/comments`),
    addComment: (postId: string, content: string) => 
      fetchApi(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  },

  // --- Utilisateurs & Profils ---
  users: {
    getProfile: (userId: string) => fetchApi(`/users/${userId}`),
    updateUsername: (username: string) => fetchApi('/users/username', { method: 'PUT', body: JSON.stringify({ username }) }),
    becomeSeller: (sellerData: any) => fetchApi('/users/become-seller', { method: 'POST', body: JSON.stringify(sellerData) }),
    getFollowers: (userId: string) => fetchApi(`/users/${userId}/followers`),
    getOrders: (userId: string) => fetchApi(`/users/${userId}/orders`),
  },

  // --- Deals & Recherche ---
  deals: {
    getRecommended: () => fetchApi('/deals/recommended'),
  },
  search: {
    query: (keyword: string) => fetchApi(`/search?q=${encodeURIComponent(keyword)}`),
    getSuggestions: () => fetchApi('/search/suggestions'),
  },

  // --- Notifications ---
  notifications: {
    getAll: () => fetchApi('/notifications'),
    getUnreadCount: () => fetchApi('/notifications/unread-count'),
    markAsRead: () => fetchApi('/notifications/mark-as-read', { method: 'POST' }),
    saveToken: (token: string) => fetchApi('/notifications/save-token', { method: 'POST', body: JSON.stringify({ token }) }),
  },

  // --- Admin & Analytics ---
  analytics: {
    track: (eventData: any) => fetchApi('/analytics/track', { method: 'POST', body: JSON.stringify(eventData) }),
  },
  admin: {
    getPioneers: () => fetchApi('/admin/pioneers'),
  }
};