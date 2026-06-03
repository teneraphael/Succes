import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  // Sécurité : n'autoriser que les domaines connus
  const allowedDomains = ["ufs.sh", "utfs.io", "uploadthing.com"];
  const isAllowed = allowedDomains.some((domain) => url.includes(domain));
  if (!isAllowed) {
    return new NextResponse("Domain not allowed", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        Referer: "https://dealcity.app/",
      },
      // ✅ Ne pas suivre les redirections automatiquement
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Image fetch failed: ${response.status} ${response.statusText} for ${url}`);
      return new NextResponse(`Image fetch failed: ${response.status}`, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Vérifier que c'est bien une image
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 400 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("og-image proxy error:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}