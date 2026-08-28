import { z } from "zod";
import { parsePhoneNumber } from "libphonenumber-js";

const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;


const nameField = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "This field is required"
        : "Invalid input",
  })


  .refine((val) => !val.includes(" "), {
    message: "Spaces are not allowed",
  })


  .refine((val) => !/[0-9]/.test(val), {
    message: "Numbers are not allowed",
  })


  .refine((val) => /^[A-Za-z]*$/.test(val), {
    message: "Special characters are not allowed",
  })

  .min(1, "Must be at least 1 characters")
  .max(50, "Must not exceed 50 characters");



const emailField = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Email is required"
        : "Invalid email",
  })
  .trim()
  .email("Please enter a valid email address")
  .transform((val) => val.toLowerCase());

const phoneField = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Phone number is required"
        : "Invalid phone number",
  })
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (val) => {
      try {
        const phoneNumber = parsePhoneNumber(val);
        return (
          phoneNumber &&
          phoneNumber.nationalNumber.length >= 6 &&
          phoneNumber.nationalNumber.length <= 15
        );
      } catch (error) {
        return false;
      }
    },
    {
      message: "Phone number must be between 6 and 15 digits",
    }
  );

const passwordField = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(12, "Password must not exceed 12 characters")
  .refine((val) => val === val.trim(), {
    message: "Password cannot start or end with spaces",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must contain at least one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Must contain at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Must contain at least one special character",
  });


export const Step1Schema = z.object({

  firstName: nameField,
  lastName: nameField,
  email: emailField,
  phoneCountryCode: z.string().optional(),
  phoneNumber: phoneField,

  department: z.any().refine((val) => !!val, {
    message: "Department is required",
  }),

  role: z.any().refine((val) => !!val, {
    message: "Role is required",
  }),
});

export const Step2Schema = z.object({

  password: passwordField,

  confirmPassword: z.string().min(1, "Confirm password is required"),

  twoFactor: z.boolean().optional(),
});

export const FinalUserSchema = Step1Schema.merge(Step2Schema)
  .extend({
    sendWelcomeEmail: z.boolean().optional(),
    additionalNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Passwords do not match",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const EditUserSchema = z.object({

  firstName: nameField,

  lastName:nameField,
  email: emailField,

  phoneCountryCode: z.string().optional(),
  phoneNumber: phoneField,
  department: z.any().refine((val) => !!val, {
    message: "Department is required",
  }),
  role: z.any().refine((val) => !!val, {
    message: "Role is required",
  }),
  additionalNotes: z.string().optional(),
  twoFaEnabled: z.boolean().optional(),
});
