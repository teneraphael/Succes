/** Client du site DealCity. Les requêtes publiques utilisent les mêmes routes que le web. */
const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://dealcity.app').replace(/\/$/, '');

export type PublicPost = {
  id: string;
  content: string;
  price: number;
  stock: number;
  createdAt: string;
  attachments: { id: string; url: string; type: string }[];
  user: { username: string; displayName: string; avatarUrl?: string | null; phoneNumber?: string | null; isVerified?: boolean };
  _count?: { likes: number; comments: number };
};

export type PostsPage = { posts: PublicPost[]; nextCursor: string | null };

export async function getForYouPage(cursor?: string | null, signal?: AbortSignal): Promise<PostsPage> {
  const url = new URL('/api/posts/for-you', SITE_URL);
  if (cursor) url.searchParams.set('cursor', cursor);

  const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Impossible de charger les annonces (${response.status}).`);

  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('posts' in data) || !Array.isArray(data.posts)) {
    throw new Error('La réponse du fil est invalide.');
  }
  const page = data as PostsPage;
  return { posts: page.posts, nextCursor: page.nextCursor ?? null };
}

export async function fetchPosts(): Promise<PublicPost[]> {
  return (await getForYouPage()).posts;
}

export { SITE_URL };
