import { prisma } from "@/shared/db/prisma";

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
};
