import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { pipeline } from "node:stream/promises";

const slug = process.argv[2];
const pageUrl = process.argv[3];

if (!slug || !pageUrl) {
  console.error("Usage: node fetch-product-main-image.mjs <slug> <page-url>");
  process.exit(1);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const req = client.get(url, { headers: options.headers }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (!location) return reject(new Error("Redirect without location"));
        const resolved = new URL(location, url).toString();
        request(resolved, options).then(resolve, reject);
        return;
      }
      if (res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      resolve(res);
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error(`Timeout for ${url}`)));
  });
}

async function fetchHtml(url) {
  const res = await request(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const chunks = [];
  for await (const chunk of res) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

function extractOgImage(html) {
  let m = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["']/i
  );
  if (m) return m[1];
  m = html.match(
    /<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*property=["']og:image["']/i
  );
  return m ? m[1] : null;
}

async function main() {
  const html = await fetchHtml(pageUrl);
  const imageUrl = extractOgImage(html);
  if (!imageUrl) throw new Error("No og:image found");

  const absoluteImageUrl = new URL(imageUrl, pageUrl).toString();
  const parsed = new URL(absoluteImageUrl);
  const extMatch = parsed.pathname.match(/\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "png";
  const safeExt = ext === "jpeg" ? "jpg" : ext;

  const outDir = path.join("fixing-botched-product-images", slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug}.${safeExt}`);

  const imageRes = await request(absoluteImageUrl, {
    headers: {
      "User-Agent": UA,
      Accept: "image/webp,image/apng,image/png,image/jpeg,image/*,*/*;q=0.8",
      Referer: pageUrl,
    },
  });

  const fileStream = fs.createWriteStream(outFile);
  await pipeline(imageRes, fileStream);
  const stats = fs.statSync(outFile);
  console.log(JSON.stringify({ slug, pageUrl, imageUrl: absoluteImageUrl, outFile, size: stats.size }));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
