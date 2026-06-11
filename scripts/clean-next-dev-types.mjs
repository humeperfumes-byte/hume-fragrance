import { rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

function isNextDevRunning() {
  try {
    const command =
      process.platform === "win32"
        ? "wmic process where \"name='node.exe'\" get CommandLine /value"
        : "ps -eo command";
    const output = execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).toLowerCase();

    return output.includes("next") && output.includes(" dev");
  } catch {
    return false;
  }
}

if (isNextDevRunning()) {
  console.log("Skipping .next/dev cleanup because next dev is running.");
} else {
  rmSync(join(process.cwd(), ".next", "dev"), { recursive: true, force: true });
}
