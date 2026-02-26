import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
