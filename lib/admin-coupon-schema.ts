import { z } from "zod";
import { couponRulesSchema } from "./growth/rules";

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code must contain at least 3 characters")
      .max(32)
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Use only letters, numbers, hyphens or underscores",
      ),
    title: z.string().trim().min(2, "Coupon title is required").max(120),
    description: z.string().trim().max(400).optional().default(""),
    type: z.enum(["fixed", "percent", "free_shipping", "free_sample"]),
    value: z.coerce.number().nonnegative(),
    rules: couponRulesSchema.optional(),
    minSubtotal: z.coerce.number().min(0).default(0),
    active: z.boolean().default(true),
    displayInCart: z.boolean().default(false),
    welcomeBackMode: z.enum(["allow", "cap_5", "disable"]).default("allow"),
  })
  .superRefine((value, context) => {
    if (["fixed", "percent"].includes(value.type) && value.value <= 0)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Discount must be greater than zero",
      });
    if (value.type === "free_sample" && !value.rules?.sampleProductId)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rules"],
        message: "Choose the free sample product",
      });
    if (value.type === "percent" && value.value > 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Percentage discount cannot exceed 100%",
      });
    }
  });

export function couponDescription(input: z.infer<typeof couponInputSchema>) {
  return (
    input.description || (input.type === "free_shipping" ? `Free delivery above ₹${input.minSubtotal}` : input.type === "free_sample" ? `Free sample above ₹${input.minSubtotal}` : "") ||
    (input.type === "percent"
      ? `${input.value}% off above ₹${input.minSubtotal}`
      : `₹${input.value} off above ₹${input.minSubtotal}`)
  );
}
