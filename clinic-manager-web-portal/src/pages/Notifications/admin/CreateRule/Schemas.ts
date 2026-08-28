// Schemas.ts
import { z } from "zod";

export const FinalRuleSchema = z
  .object({
    // Step 1
    ruleType: z.enum(["notification", "escalation"]),

   ruleName: z
  .string()
  .min(1, "Rule name is required")
  .regex(/^[a-zA-Z ]+$/, "Rule name can only contain letters")
  .refine((val) => val.trim().length > 0, {
    message: "Rule name cannot be only spaces",
  })
  .refine((val) => !/\s{2,}/.test(val), {
    message: "Rule name cannot contain consecutive spaces",
  })
  .refine((val) => !val.endsWith(" "), {
    message: "Rule name cannot end with a space",
  }),

    // Notification rule
    triggerEvent: z.number().optional(),

    // Escalation rule
    escalationCondition: z.number().optional(),
    escalationAction: z.number().optional(),

    // Step 2
    channelInApp: z.boolean(),
    channelEmail: z.boolean(),
    channelDigest: z.boolean(),

    // Step 3
    recipients: z
      .array(z.string())
      .min(1, "At least one recipient is required"),
  })
  .superRefine((data, ctx) => {
    // ---------- Notification rule validation ----------
    if (data.ruleType === "notification") {
      if (!data.triggerEvent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["triggerEvent"],
          message: "Trigger event is required for notification rules",
        });
      }
    }

    // ---------- Escalation rule validation ----------
    if (data.ruleType === "escalation") {
      if (!data.escalationCondition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["escalationCondition"],
          message: "Escalation condition is required",
        });
      }

      if (!data.escalationAction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["escalationAction"],
          message: "Escalation action is required",
        });
      }
    }
  });

export type CreateRuleFormValues = z.infer<typeof FinalRuleSchema>;
