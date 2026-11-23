import { readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const appPublic = resolve("android/app/src/main/assets/public");
const keep = new Set([
  "capacitor.config.json",
  "capacitor.plugins.json",
  "native-bridge.js",
]);

for (const entry of await readdir(appPublic, { withFileTypes: true })) {
  if (!keep.has(entry.name)) {
    await rm(join(appPublic, entry.name), { recursive: true, force: true });
  }
}

await writeFile(
  join(appPublic, "index.html"),
  "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>SR Studio Admin</title></head><body><p>Connecting to SR Studio…</p></body></html>",
);

console.log("Pruned packaged web assets; the Android shell loads the live Cloudflare Worker.");
