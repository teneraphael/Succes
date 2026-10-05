import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { LRUCache } from "lru-cache";

const execute = promisify(execFile);
const cache = new LRUCache<string, Buffer>({
  maxSize: 24 * 1024 * 1024,
  sizeCalculation: (value) => value.length,
  ttl: 60 * 60 * 1000,
});
const pending = new Map<string, Promise<Buffer>>();

// Only media hosted by the services already used by DealCity may be fetched.
export function trustedMediaUrl(value: string): string {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !(
      host === "utfs.io" ||
      host.endsWith(".utfs.io") ||
      host.endsWith(".ufs.sh") ||
      host === "bdvksesmeppwtzeofudv.supabase.co"
    )
  ) {
    throw new Error("Unsupported media host");
  }
  return url.toString();
}

const overlay = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shade" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><circle cx="600" cy="295" r="58" fill="#fff" fill-opacity=".94"/><path d="M585 267L585 323L631 295Z" fill="#171717"/><text x="45" y="575" font-family="sans-serif" font-size="32" font-weight="700" fill="#fff">DealCity</text><text x="1155" y="575" text-anchor="end" font-family="sans-serif" font-size="22" fill="#fff">Voir la vidéo</text></svg>`,
);

export async function videoPreview(
  videoUrl: string,
  thumbnailUrl?: string | null,
  poster = false,
): Promise<Buffer> {
  const source = trustedMediaUrl(thumbnailUrl || videoUrl);
  const key = `${poster ? "poster" : "share"}:${source}`;
  const saved = cache.get(key);
  if (saved) return saved;
  const existing = pending.get(key);
  if (existing) return existing;
  // Bound ffmpeg work on public requests; a failed preview can be retried.
  if (pending.size >= 2) throw new Error("Preview generation busy");
  const work = (async () => {
    let frame: Buffer;
    if (thumbnailUrl) {
      const response = await fetch(source, {
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.startsWith("image/")
      )
        throw new Error("Thumbnail unavailable");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Empty thumbnail");
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 8 * 1024 * 1024) throw new Error("Thumbnail too large");
          chunks.push(value);
        }
      } finally {
        await reader.cancel();
      }
      frame = Buffer.concat(chunks);
    } else {
      const result = await execute(
        ffmpegInstaller.path,
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-nostdin",
          "-protocol_whitelist",
          "https,tls,tcp",
          "-rw_timeout",
          "10000000",
          "-ss",
          "0",
          "-i",
          source,
          "-frames:v",
          "1",
          "-an",
          "-vf",
          "scale=w='min(1200,iw)':h='min(1200,ih)':force_original_aspect_ratio=decrease",
          "-f",
          "image2pipe",
          "-vcodec",
          "mjpeg",
          "pipe:1",
        ],
        {
          encoding: "buffer",
          timeout: 15000,
          killSignal: "SIGKILL",
          maxBuffer: 8 * 1024 * 1024,
        },
      );
      frame = result.stdout;
    }
    const image = sharp(frame, { limitInputPixels: 40_000_000 });
    const result = poster
      ? await image
          .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 82 })
          .toBuffer()
      : await image
          .resize(1200, 630, { fit: "contain", background: "#09090b" })
          .composite([{ input: overlay }])
          .jpeg({ quality: 85 })
          .toBuffer();
    cache.set(key, result);
    return result;
  })();
  pending.set(key, work);
  try {
    return await work;
  } finally {
    pending.delete(key);
  }
}
