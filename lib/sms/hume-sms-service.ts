type HumeSmsInput = {
  to: string;
  otp: string;
};

type HumeSmsResult = {
  ok: boolean;
  sent: boolean;
  status: "sent" | "failed" | "dry_run";
  provider?: "fast2sms";
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

  const payload = new URLSearchParams({
    route: "otp",
    variables_values: input.otp,
    numbers: mobile,
  });

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
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
        error: message || `Fast2SMS returned ${response.status}`,
      };
    }

    return { ok: true, sent: true, status: "sent", provider: "fast2sms" };
  } catch (error) {
    return {
      ok: false,
      sent: false,
      status: "failed",
      provider: "fast2sms",
      error: normalizeError(error),
    };
  }
}
