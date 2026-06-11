import { z } from "zod";
import { ProfessionalDocumentType } from "../../generated/prisma/enums";
import { isValidDate } from "../../shared/utils/formatters";

export const createUserSchema = z.object({
  fullName: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.email("Endereço de e-mail inválido"),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 11, "CPF deve conter exatamente 11 dígitos numéricos"),
  birthDate: z.string().refine(isValidDate, "Data de nascimento inválida"),
  phone: z.string().optional(),

  zipCode: z.string(),
  streetAddress: z.string(),
  number: z.string().optional(),
  additionalInfo: z.string().optional(),
  neighborhood: z.string(),
  addressCity: z.string(),
  state: z.string(),

  roles: z
    .array(
      z.object({
        roleId: z.uuid("ID do cargo inválido"),
        facilities: z.array(z.uuid("ID da unidade inválido")).optional(),
        permissionIds: z.array(z.uuid("ID da permissão inválido")).optional(),
      })
    )
    .min(1, "O usuário precisa ter ao menos um cargo associado"),

  professionalDocuments: z
    .array(
      z.object({
        documentType: z.enum(ProfessionalDocumentType, {
          message: "Tipo de documento profissional inválido",
        }),
        documentNumber: z.string().min(1, "Número do documento é obrigatório"),
      })
    )
    .optional(),
});

export const resendActivationSchema = z.object({
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 11, "CPF deve conter exatamente 11 dígitos numéricos"),
  email: z.email("Endereço de e-mail inválido"),
  birthDate: z.string().refine(isValidDate, "Data de nascimento inválida"),
});

export const confirmActivationSchema = z
  .object({
    token: z.string().min(1, "Token de ativação é obrigatório"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ResendActivationInput = z.infer<typeof resendActivationSchema>;
export type ConfirmActivationInput = z.infer<typeof confirmActivationSchema>;
