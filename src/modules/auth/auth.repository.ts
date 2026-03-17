import { prisma } from "@/shared/db/prisma";
import { formatDate } from "@/shared/utils";

export const AuthRepository = {
  findUserByCPF(cpf: string) {
    return prisma.user.findUnique({
      where: { cpf, isDeleted: false },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id, isDeleted: false },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  },

  checkUserForResetPasswordFirstStep(cpf: string, email: string, birthDate: string) {
    const parsedBirthDate = formatDate(birthDate);

    return prisma.user.findUnique({
      where: { cpf, email, birthDate: parsedBirthDate, isDeleted: false },
    });
  },

  resetPassword(userId: string, password: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash: password },
    });
  },
};
