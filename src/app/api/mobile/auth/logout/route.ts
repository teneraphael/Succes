import { lucia } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const sessionId =
      authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length).trim()
        : null;

    if (sessionId) {
      await lucia.invalidateSession(sessionId);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur mobile logout:", error);
    return Response.json({ success: true });
  }
}
