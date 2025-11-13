import assert from "node:assert";
import { ImageService } from "../src/services/imageService";

// Typed mock for fetch compatible with Node's global fetch signature
const fetchMock: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let urlStr: string;
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else {
    urlStr = (input as Request).url;
  }

  const ok = urlStr.includes("/api/image-proxy");
  return new Response("", {
    status: ok ? 200 : 404,
    headers: { "content-type": "image/jpeg" },
  });
};

globalThis.fetch = fetchMock;

async function run() {
  const original = "https://sv1.imgkc1.my.id/wp-content/img/A/A_Bad_Person/005/001.jpg";
  const proxied = ImageService.createProxyUrl(original);
  assert.strictEqual(proxied, "/api/image-proxy?id=1&path=wp-content%2Fimg%2FA%2FA_Bad_Person%2F005%2F001.jpg", "createProxyUrl should produce production query format");

  const unknown = "https://example.com/image.jpg";
  assert.strictEqual(ImageService.createProxyUrl(unknown), unknown, "Unknown domain should not be proxied");

  const already = "/api/image-proxy?id=2&path=wp-content/img/sample.jpg";
  const url = await ImageService.getImageUrl(already);
  assert.strictEqual(url, already, "Already proxied URL should be returned as-is");

  const generated = await ImageService.getImageUrl(original);
  assert.strictEqual(generated, "/api/image-proxy?id=1&path=wp-content%2Fimg%2FA%2FA_Bad_Person%2F005%2F001.jpg", "getImageUrl should fall back to proxied URL if accessible");

  console.log("✅ All ImageService tests passed");
}

run().catch((e) => {
  console.error("❌ Tests failed", e);
  process.exit(1);
});
