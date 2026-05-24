import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  consumeOtp,
  createAccountSession,
  findAccountProfileForIdentity,
  findUsableOtp,
  hashOtp,
  incrementOtpAttempts,
  type AccountIdentity,
} from "@/lib/account-login";

const verifySchema = z.object({
  requestId: z.string().min(8).max(255),
  code: z.string().regex(/^\d{4}$/),
});

function getRequestMeta(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() || realIp || null,
    userAgent: request.headers.get("user-agent"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, code } = verifySchema.parse(body);
    const otpRequest = await findUsableOtp(requestId);

    if (!otpRequest) {
      return NextResponse.json(
        { ok: false, error: "This code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    if (otpRequest.attempts >= 5) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please request a new code." },
        { status: 429 },
      );
    }

    if (hashOtp(code, requestId) !== otpRequest.otpHash) {
      await incrementOtpAttempts(requestId, otpRequest.attempts);
      return NextResponse.json(
        { ok: false, error: "Incorrect code. Check the email and try again." },
        { status: 400 },
      );
    }

    const identity: AccountIdentity = {
      type: otpRequest.identityType === "email" ? "email" : "phone",
      value: otpRequest.identifier,
    };
    const profile = await findAccountProfileForIdentity(identity);

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "We could not load this account anymore." },
        { status: 404 },
      );
    }

    await consumeOtp(requestId);

    const { ipAddress, userAgent } = getRequestMeta(request);
    const accountToken = await createAccountSession({
      identity,
      profile,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      accountToken,
      profile,
    });
  } catch (error) {
    console.error("account otp verify error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to verify this login code." },
      { status: 500 },
    );
  }
}
