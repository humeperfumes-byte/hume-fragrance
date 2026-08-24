import { z } from "zod";

export const couponInputSchema = z
  .object({
    code: z.string().trim().min(3, "Coupon code must contain at least 3 characters").max(32)
      .regex(/^[A-Za-z0-9_-]+$/, "Use only letters, numbers, hyphens or underscores"),
    title: z.string().trim().min(2, "Coupon title is required").max(120),
    description: z.string().trim().max(400).optional().default(""),
    type: z.enum(["fixed", "percent"]),
    value: z.coerce.number().positive("Discount value must be greater than zero"),
    minSubtotal: z.coerce.number().min(0).default(0),
    active: z.boolean().default(true),
    displayInCart: z.boolean().default(false),
    welcomeBackMode: z.enum(["allow", "cap_5", "disable"]).default("allow"),
  })
  .superRefine((value, context) => {
    if (value.type === "percent" && value.value > 100) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Percentage discount cannot exceed 100%" });
    }
  });

export function couponDescription(input: z.infer<typeof couponInputSchema>) {
  return input.description || (input.type === "percent"
    ? `${input.value}% off above ₹${input.minSubtotal}`
    : `₹${input.value} off above ₹${input.minSubtotal}`);
}
