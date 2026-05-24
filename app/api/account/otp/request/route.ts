import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { accountLoginOtps } from "@/db/schema";
import {
  accountOtpConfig,
  addMinutes,
  findAccountProfileForIdentity,
  generateOtp,
  hasRecentOtp,
  hashOtp,
  maskEmail,
  parseAccountIdentity,
} from "@/lib/account-login";
import { buildAccountOtpEmail } from "@/lib/email/account-otp-template";
import { sendHumeEmail } from "@/lib/email/hume-mail-service";

const requestSchema = z.object({
  identifier: z.string().min(4).max(255),
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
    const { identifier } = requestSchema.parse(body);
    const identity = parseAccountIdentity(identifier);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email or 10 digit mobile number." },
        { status: 400 },
      );
    }

    if (await hasRecentOtp(identity)) {
      return NextResponse.json(
        { ok: false, error: "A code was just sent. Please wait a moment before requesting again." },
        { status: 429 },
      );
    }

    const profile = await findAccountProfileForIdentity(identity);
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "No checkout account was found for this email or mobile number." },
        { status: 404 },
      );
    }

    const destinationEmail = profile.email || (identity.type === "email" ? identity.value : "");
    if (!destinationEmail) {
      return NextResponse.json(
        { ok: false, error: "This mobile number has no email saved. Login with the email used at checkout." },
        { status: 422 },
      );
    }

    const requestId = randomUUID();
    const otp = generateOtp();
    const { ipAddress, userAgent } = getRequestMeta(request);

    await db.insert(accountLoginOtps).values({
      id: requestId,
      identityType: identity.type,
      identifier: identity.value,
      destinationEmail,
      otpHash: hashOtp(otp, requestId),
      expiresAt: addMinutes(new Date(), accountOtpConfig.otpTtlMinutes),
      ipAddress,
      userAgent,
    });

    const email = buildAccountOtpEmail({
      otp,
      customerName: profile.fullName,
      expiresInMinutes: accountOtpConfig.otpTtlMinutes,
    });

    const sendResult = await sendHumeEmail({
      to: destinationEmail,
      subject: `Your HUME login code is ${otp}`,
      html: email.html,
      text: email.text,
      messageType: "account_otp",
      relatedType: "account_login_otp",
      relatedId: requestId,
      payload: {
        identityType: identity.type,
        identifier: identity.value,
      },
    });

    if (!sendResult.ok) {
      return NextResponse.json(
        { ok: false, error: "Unable to send the login code right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      expiresInMinutes: accountOtpConfig.otpTtlMinutes,
      deliveryHint: maskEmail(destinationEmail),
      dryRun: sendResult.status === "dry_run",
    });
  } catch (error) {
    console.error("account otp request error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to start account login." },
      { status: 500 },
    );
  }
}
