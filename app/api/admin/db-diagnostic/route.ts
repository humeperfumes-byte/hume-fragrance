import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");
  const pid = searchParams.get("pid");

  // Simple token authorization
  if (token !== "hume-db-9821") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (action === "kill" && pid) {
      const pidNum = parseInt(pid, 10);
      if (isNaN(pidNum)) {
        return NextResponse.json({ error: "Invalid pid" });
      }
      const killResult = await db.execute(sql`SELECT pg_terminate_backend(${pidNum}) as killed`);
      return NextResponse.json({ ok: true, result: killResult });
    }

    // Get active queries
    const activeQueries = await db.execute(sql`
      SELECT 
        pid, 
        query, 
        state, 
        query_start as "queryStart",
        age(clock_timestamp(), query_start) as age,
        application_name as "appName",
        client_addr as "clientAddr"
      FROM pg_stat_activity 
      WHERE state != 'idle'
      ORDER BY query_start ASC
    `);

    // Get locks
    const locks = await db.execute(sql`
      SELECT 
        t.relname AS relation,
        l.mode,
        l.locktype,
        l.granted,
        l.pid,
        a.query
      FROM pg_locks l
      JOIN pg_class t ON l.relation = t.oid
      JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE t.relname NOT LIKE 'pg_%'
    `);

    return NextResponse.json({
      ok: true,
      activeQueries: activeQueries,
      locks: locks,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || error });
  }
}
