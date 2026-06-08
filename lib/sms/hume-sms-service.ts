type HumeSmsInput = {
  to: string;
  otp: string;
};

type HumeSmsResult = {
  ok: boolean;
  sent: boolean;
  status: "sent" | "failed" | "dry_run";
  provider?: "fast2sms";
  mode?: "otp_api" | "bulk_otp";
  error?: string;
};

function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeError(error: unknown) {
  if (!error) return "Unknown SMS provider error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown SMS provider error";
  }
}

export function isHumeSmsConfigured() {
  return Boolean(process.env.FAST2SMS_API_KEY || process.env.SMS_DRY_RUN === "true");
}

async function sendViaOtpApi({
  apiKey,
  mobile,
  otp,
  otpId,
}: {
  apiKey: string;
  mobile: string;
  otp: string;
  otpId: string;
}): Promise<HumeSmsResult> {
  const response = await fetch("https://www.fast2sms.com/dev/otp/send", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mobile,
      otp_id: otpId,
      otp_length: otp.length,
      otp_expiry: 10,
      otp,
      variables_values: otp,
    }),
  });
  const data = (await response.json().catch(() => null)) as {
    return?: boolean;
    message?: string | string[];
  } | null;

  if (!response.ok || data?.return === false) {
    const message = Array.isArray(data?.message)
      ? data?.message.join(" ")
      : data?.message;
    return {
      ok: false,
      sent: false,
      status: "failed",
      provider: "fast2sms",
      mode: "otp_api",
      error: message || `Fast2SMS OTP API returned ${response.status}`,
    };
  }

  return { ok: true, sent: true, status: "sent", provider: "fast2sms", mode: "otp_api" };
}

async function sendViaBulkOtp({
  apiKey,
  mobile,
  otp,
}: {
  apiKey: string;
  mobile: string;
  otp: string;
}): Promise<HumeSmsResult> {
  const params = new URLSearchParams({
    authorization: apiKey,
    route: "otp",
    variables_values: otp,
    numbers: mobile,
  });
  const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
    method: "GET",
  });
  const data = (await response.json().catch(() => null)) as {
    return?: boolean;
    message?: string | string[];
  } | null;

  if (!response.ok || data?.return === false) {
    const message = Array.isArray(data?.message)
      ? data?.message.join(" ")
      : data?.message;
    return {
      ok: false,
      sent: false,
      status: "failed",
      provider: "fast2sms",
      mode: "bulk_otp",
      error: message || `Fast2SMS bulk OTP returned ${response.status}`,
    };
  }

  return { ok: true, sent: true, status: "sent", provider: "fast2sms", mode: "bulk_otp" };
}

export async function sendHumeOtpSms(input: HumeSmsInput): Promise<HumeSmsResult> {
  const mobile = normalizeIndianMobile(input.to);
  if (mobile.length !== 10) {
    return {
      ok: false,
      sent: false,
      status: "failed",
      error: "A valid 10 digit mobile number is required.",
    };
  }

  if (process.env.SMS_DRY_RUN === "true") {
    console.info(`SMS_DRY_RUN account OTP for ${mobile}: ${input.otp}`);
    return { ok: true, sent: false, status: "dry_run", provider: "fast2sms" };
  }

  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      sent: false,
      status: "failed",
      provider: "fast2sms",
      error: "FAST2SMS_API_KEY is not configured.",
    };
  }

  const otpId = process.env.FAST2SMS_OTP_ID?.trim();

  try {
    if (otpId) {
      return await sendViaOtpApi({ apiKey, mobile, otp: input.otp, otpId });
    }

    return await sendViaBulkOtp({ apiKey, mobile, otp: input.otp });
  } catch (error) {
    return {
      ok: false,
      sent: false,
      status: "failed",
      provider: "fast2sms",
      mode: otpId ? "otp_api" : "bulk_otp",
      error: normalizeError(error),
    };
  }
}
