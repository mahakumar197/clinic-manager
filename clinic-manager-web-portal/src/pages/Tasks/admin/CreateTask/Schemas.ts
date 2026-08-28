import { z } from "zod";

export const Step1Schema = z.object({
  patientId: z
    .string()
    .nullable()
    .refine((val) => val !== null, {
      message: "Please select a patient",
    }),
  patient: z.any().optional(),
});

export const Step2Schema = z
  .object({
    template: z.any().optional(),

    taskName: z
  .string()
  .min(1, "Task Name is required")
  .refine(val => !val.startsWith(" "), {
    message: "Task Name should not start with a space",
  })
  .refine(val => !val.endsWith(" "), {
    message: "Task Name should not end with a space",
  })
  .regex(/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/, {
    message: "Task Name can only contain letters and numbers",
  }),
  
    description: z.string().max(250, "Description should not allow more than 250 characters....").optional(),

    // phase: z.any().refine((val) => !!val, {
    //   message: "Phase is required",
    // }),

    category: z.any().refine((val) => !!val, {
      message: "Category is required",
    }),

    zohoForm: z.any(),
    contentType: z.any(),
  })
  .superRefine((data, ctx) => {
    const isWatchContent = data.category?.label === "Watch Content";

    if (isWatchContent) {
      if (!data.contentType) {
        ctx.addIssue({
          path: ["contentType"],
          message: "Content type is required",
          code: z.ZodIssueCode.custom,
        });
      }
    } else {
      if (!data.zohoForm) {
        ctx.addIssue({
          path: ["zohoForm"],
          message: "Zoho form is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export const Step3Schema = z.object({
  assignee: z.any().refine((val) => !!val, {
    message: "Assignee is required",
  }),

  dueDate: z.any().refine((val) => !!val, {
    message: "Due Date is required",
  }),
});

/**
 * FULL SCHEMA (MERGED)
 */
export const CreateTaskSchema =
  Step1Schema.merge(Step2Schema).merge(Step3Schema);
