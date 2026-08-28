import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z.string().min(1, "Password is required")
            .refine(
            (val) => val === val.trim(),
            "Password cannot start or end with spaces"
           ),
    rememberMe: z.boolean().optional(),
    device: z.string()
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    password: z
        .string()
        // .min(1, "Password is required")
         .min(8, "Password must be at least 8 characters")
        .refine(
    (val) => val === val.trim(),
    "Password cannot start or end with spaces"
  )
   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
   .regex(
        /[!@#$%^&*(),.?\":{}|<>]/,
        "Password must contain at least one special character"
      ),
//   .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
