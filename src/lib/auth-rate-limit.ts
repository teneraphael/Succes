import { createHash } from "node:crypto";
import prisma from "@/lib/prisma";

// Atomic, database-backed fixed windows: restarting or scaling a server does not
// reset the budget. Database failures throw, rather than silently allowing abuse.
export async function consumeAuthAttempt(scope: string, identifier: string, limit: number, windowMs: number) {
  const key = createHash("sha256").update(`${scope}:${identifier.trim().toLowerCase()}`).digest("hex");
  // Bounded cleanup avoids retaining expired identifiers indefinitely.
  await prisma.$executeRaw`
    DELETE FROM "AuthRateLimit" WHERE "expiresAt" <= CURRENT_TIMESTAMP AND "key" IN
      (SELECT "key" FROM "AuthRateLimit" WHERE "expiresAt" <= CURRENT_TIMESTAMP LIMIT 100)
  `;
  const rows = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO "AuthRateLimit" ("key", "attempts", "expiresAt")
    VALUES (${key}, 1, CURRENT_TIMESTAMP + ${windowMs} * INTERVAL '1 millisecond')
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE WHEN "AuthRateLimit"."expiresAt" <= CURRENT_TIMESTAMP
        THEN 1 ELSE LEAST("AuthRateLimit"."attempts" + 1, ${limit + 1}) END,
      "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= CURRENT_TIMESTAMP
        THEN CURRENT_TIMESTAMP + ${windowMs} * INTERVAL '1 millisecond'
        ELSE "AuthRateLimit"."expiresAt" END
    RETURNING "attempts"
  `;
  return rows.length === 1 && rows[0].attempts <= limit;
}
