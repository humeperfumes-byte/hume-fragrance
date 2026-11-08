// OpenNext generates this module before Wrangler bundles the Worker.
import handler from "./.open-next/worker.js";
import postgres from "postgres";
import { purgeLiveChat } from "./lib/purge-live-chat";

const worker = {
  fetch: handler.fetch,
  async scheduled(_event, env) {
    const client = postgres(env.HYPERDRIVE.connectionString, { max: 1, fetch_types: false, connect_timeout: 5 });
    try {
      console.info("Live chat retention", await purgeLiveChat(client));
    } finally {
      await client.end({ timeout: 5 });
    }
  },
};

export default worker;
