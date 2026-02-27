import { prisma } from "@/shared/db/prisma";

export const AuthRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, isDeleted: false },
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
