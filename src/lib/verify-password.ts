import { verify } from "@node-rs/argon2";
import { scryptSync, timingSafeEqual } from "crypto";

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (hash.startsWith("$argon2")) return verify(hash, password);

  // Les premiers comptes vendeurs ont été créés avec scrypt.
  const match = /^([a-f0-9]{32}):([a-f0-9]{128})$/.exec(hash);
  if (!match) return false;
  const expected = Buffer.from(match[2], "hex");
  return timingSafeEqual(scryptSync(password, match[1], expected.length), expected);
}
