import { z } from "zod";

export const loginSchema = z.object({
  credential: z.string().min(11, { message: "CPF must be at least 11 characters" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
