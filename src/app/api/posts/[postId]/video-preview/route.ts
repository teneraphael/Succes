import prisma from "@/lib/prisma";
import { videoPreview } from "@/lib/video-preview";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, like the post itself: social crawlers do not have a user session.
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: {
      thumbnailUrl: true,
      attachments: {
        where: { type: "VIDEO" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { url: true, settings: true },
      },
    },
  });
  const video = post?.attachments[0];
  if (!post || !video) return new Response(null, { status: 404 });
  try {
    const settings = video.settings as { thumbnailUrl?: string } | null;
    const thumbnail =
      post.thumbnailUrl ||
      (typeof settings?.thumbnailUrl === "string"
        ? settings.thumbnailUrl
        : null);
    const image = await videoPreview(
      video.url,
      thumbnail,
      request.nextUrl.searchParams.get("poster") === "1",
    );
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    // Never cache a temporary extraction failure as the post's permanent preview.
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "15" },
    });
  }
}
