import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getKitAvailability, setKitAvailability } from "@/lib/kit-availability";
import { requireAdminToken } from "@/lib/admin-auth";

const payloadSchema = z.object({
  outOfStock: z.boolean(),
});

export async function GET() {
  const availability = await getKitAvailability();
  return NextResponse.json(availability, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const data = payloadSchema.parse(body);
    const availability = await setKitAvailability(data.outOfStock);

    return NextResponse.json({
      ok: true,
      ...availability,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid kit availability" }, { status: 400 });
    }
    console.error("Kit availability update failed:", error);
    return NextResponse.json({ ok: false, error: "Unable to update kit availability" }, { status: 500 });
  }
}
