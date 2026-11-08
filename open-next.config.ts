import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({}),
  // The Windows Turbopack build emits server chunk paths that fail in workerd.
  buildCommand: "npm run build -- --webpack",
};
