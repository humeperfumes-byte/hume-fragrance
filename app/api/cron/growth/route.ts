import { NextRequest, NextResponse } from "next/server";
import {
  processCampaigns,
  reconcileBatch,
  whatsappStatus,
} from "@/lib/growth/campaigns";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const started = Date.now();
    const campaigns = whatsappStatus().canSend
      ? await processCampaigns()
      : { skipped: true };
    const rewards = await reconcileBatch(Math.max(0, 45000-(Date.now()-started)));
    return NextResponse.json({ rewards, campaigns });
  } catch {
    return NextResponse.json(
      { error: "Growth processing needs retry" },
      { status: 503 },
    );
  }
}
