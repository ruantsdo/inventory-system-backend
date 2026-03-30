import { z } from "zod";

export const loginSchema = z.object({
  credential: z.string().min(11, { message: "CPF must be at least 11 characters" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
});

export const resetPasswordFirstStepSchema = z.object({
  cpf: z
    .string()
    .min(1, "CPF is required")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 11, "CPF must be at least 11 characters"),

  email: z.email("Invalid email").min(1, "Email is required"),

  birthDate: z
    .string()
    .min(1, "Birth date is required")
    .refine((val) => {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      return dateRegex.test(val);
    }, "Invalid date format (DD/MM/YYYY)"),
});

export const resetPasswordSecondStepSchema = z
  .object({
    newPassword: z.string().min(6, "New password must be at least 6 characters"),

    confirmPassword: z.string(),

    token: z.string().min(1, "Token is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordFirstStepInput = z.infer<typeof resetPasswordFirstStepSchema>;
export type ResetPasswordSecondStepInput = z.infer<typeof resetPasswordSecondStepSchema>;
