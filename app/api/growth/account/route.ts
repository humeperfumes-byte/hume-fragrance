import {readBoundedJson} from "@/lib/bounded-request-body";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import {
  verifiedAccount,
  ensureAccount,
  readWallet,
  query,
  GrowthError,
} from "@/lib/growth/store";
export async function POST(req: NextRequest) {
  try {
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !== req.nextUrl.origin
    )
      throw new GrowthError("Invalid origin", 403);
    const input = z
      .object({
        accountToken: z.string().max(512).optional(),
        marketingOptIn: z.boolean().optional(),
        releaseReservation: z.string().uuid().optional(),
      })
      .parse(await readBoundedJson(req,4096));
    const account = await verifiedAccount(req, input.accountToken);
    await ensureAccount(account.key, account);
    if (input.releaseReservation) {
      await query(
        sql`update growth_coin_reservations set status='released',updated_at=now() where id=${input.releaseReservation}::uuid and customer_key=${account.key} and order_id is null`,
      );
      return NextResponse.json(
        { ok: true },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    if (input.marketingOptIn !== undefined)
      await query(
        sql`update growth_accounts set marketing_opt_in=${input.marketingOptIn},consent_source='account_preferences',consent_at=now(),updated_at=now() where customer_key=${account.key}`,
      );
    const wallet = await readWallet(account.key);
    const offers = await query(
      sql`select c.title,c.body,c.link,c.created_at,r.status from growth_campaign_recipients r join growth_campaigns c on c.id=r.campaign_id where r.customer_key=${account.key} and c.status<>'draft' order by c.created_at desc limit 30`,
    );
    return NextResponse.json(
      { wallet, offers },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof GrowthError ? e.message : "Could not load your rewards.",
      },
      { status: e instanceof GrowthError ? e.status : 503 },
    );
  }
}
