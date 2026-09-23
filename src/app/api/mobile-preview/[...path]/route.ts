import { NextRequest } from "next/server";

const PRODUCTION_API = "https://dealcity.app/api";

const ALLOWED_PUBLIC_PREFIXES = [
  "posts/for-you",
  "posts/videos",
  "shops",
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const joinedPath = path.join("/");

    if (!ALLOWED_PUBLIC_PREFIXES.some((prefix) => joinedPath.startsWith(prefix))) {
      return Response.json(
        { error: "Preview proxy route not allowed" },
        { status: 403 },
      );
    }

    const target = new URL(`${PRODUCTION_API}/${joinedPath}`);

    request.nextUrl.searchParams.forEach((value, key) => {
      target.searchParams.set(key, value);
    });

    const response = await fetch(target.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "DealCity-Mobile-Preview",
      },
      cache: "no-store",
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("DealCity preview proxy error:", error);

    return Response.json(
      { error: "Impossible de joindre l API DealCity de production" },
      { status: 502 },
    );
  }
}
