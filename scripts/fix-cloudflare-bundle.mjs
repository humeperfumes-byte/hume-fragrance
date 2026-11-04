import { readFileSync, writeFileSync } from "node:fs";

// OpenNext normally applies removeMiddlewareManifestRule itself. Some build
// layouts miss the upstream patch, leaving a filesystem require in Workers.
// Match only that unsupported implementation; already-patched bundles are left
// untouched. Middleware is handled by OpenNext before the Next.js server.
const file = ".open-next/server-functions/default/handler.mjs";
const source = readFileSync(file, "utf8");
const unsupported = /getMiddlewareManifest\(\)\s*\{\s*return this\.minimalMode\s*\?\s*null\s*:\s*(?:__require|require)\(this\.middlewareManifestPath\)\s*;?\s*\}/g;
const patched = source.replace(unsupported, "getMiddlewareManifest(){return null}");
if (patched !== source) {
  writeFileSync(file, patched);
  console.log("Applied OpenNext middleware-manifest compatibility patch.");
}
