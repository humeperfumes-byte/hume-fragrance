import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureCustomerFeedback } from "@/lib/feedback";

const feedbackSchema = z.object({
  source: z.string().min(1, "Source is required."),
  sourceDetails: z.string().max(255).nullable().optional(),
  rating: z.number().int().min(1, "Rating must be at least 1.").max(5, "Rating cannot exceed 5."),
  feedbackText: z.string().max(2048).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    await captureCustomerFeedback({
      source: data.source,
      sourceDetails: data.sourceDetails,
      rating: data.rating,
      feedbackText: data.feedbackText,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message || "Invalid feedback data." },
        { status: 400 }
      );
    }
    console.error("Feedback submit API error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
