import { NextRequest, NextResponse } from "next/server";

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;

  try {
    const url = new URL(origin);

    if (url.hostname === "dealcity.app" || url.hostname === "www.dealcity.app") {
      return true;
    }

    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return true;
    }

    if (url.hostname.endsWith(".app.github.dev")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (!isAllowedOrigin(origin)) return response;

  response.headers.set("Access-Control-Allow-Origin", origin!);
  response.headers.set("Vary", "Origin");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return addCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  return addCorsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
