// Test-process-only resolution for Next.js's build-time server marker.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS hook is required before tsx loads server-only modules in the standalone test process.
const Module = require("node:module");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolveFilename.call(this, request === "server-only" ? "next/dist/compiled/server-only/empty.js" : request, parent, ...rest);
};
