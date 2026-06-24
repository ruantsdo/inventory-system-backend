import type { Prisma } from "../../generated/prisma/client";
import type { ProfessionalDocumentType } from "../../generated/prisma/enums";
import { prisma } from "../../shared/db/prisma";
import type { UserDetailPayload } from "../../shared/types/api.contracts";
import { formatDate, formatToBRDate } from "../../shared/utils/formatters";
import type { CreateUserInput } from "./users.schema";

const detailQueryIncludes = {
  roles: {
    include: {
      facilities: {
        include: {
          facility: true,
        },
      },
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
  professionalDocuments: true,
} as const;

type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof detailQueryIncludes;
}>;

function mapToUserDetail(user: UserWithRelations): UserDetailPayload {
  return {
    fullName: user.fullName,
    email: user.email,
    cpf: user.cpf,
    birthDate: formatToBRDate(user.birthDate),
    phone: user.phone ?? undefined,
    zipCode: user.zipCode ?? undefined,
    streetAddress: user.streetAddress ?? undefined,
    number: user.number ?? undefined,
    additionalInfo: user.additionalInfo ?? undefined,
    neighborhood: user.neighborhood ?? undefined,
    addressCity: user.addressCity ?? undefined,
    state: user.state ?? undefined,
    roles: user.roles.map((userRole) => ({
      roleName: userRole.role.displayName,
      facilities: userRole.facilities.map((f) => f.facility.name),
      permissionNames: userRole.role.permissions.map((p) => p.permission.displayName),
    })),
    professionalDocuments: user.professionalDocuments.map((doc) => ({
      documentType: doc.documentType as ProfessionalDocumentType,
      documentNumber: doc.documentNumber,
      issuerState: doc.issuerState ?? undefined,
    })),
  };
}

export const usersRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByCpf(cpf: string) {
    return prisma.user.findUnique({ where: { cpf } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findBasicUserDataById(id: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async findBasicUserDataByCpf(cpf: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: { cpf },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async findBasicUserDataByEmail(email: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async getRolePermissions(roleIds: string[]) {
    return prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
      },
      include: {
        permission: true,
      },
    });
  },

  async getPermissionsByIds(permissionIds: string[]) {
    return prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });
  },

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          where: { isActive: true },
          select: {
            role: {
              select: {
                permissions: {
                  select: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const activePermissions = new Set<string>();
    for (const userRole of user.roles) {
      for (const rolePerm of userRole.role.permissions) {
        activePermissions.add(rolePerm.permission.name);
      }
    }
    return Array.from(activePermissions);
  },

  async createUser(data: CreateUserInput, tempPasswordHash: string, requestMakerId: string) {
    return prisma.$transaction(async (tx) => {
      const parsedBirthDate = formatDate(data.birthDate);

      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          cpf: data.cpf,
          birthDate: parsedBirthDate,
          phone: data.phone ?? null,
          passwordHash: tempPasswordHash,
          isActive: false,

          zipCode: data.zipCode,
          streetAddress: data.streetAddress,
          number: data.number ?? null,
          additionalInfo: data.additionalInfo ?? null,
          neighborhood: data.neighborhood,
          addressCity: data.addressCity,
          state: data.state,

          roles: {
            create: data.roles.map((role) => ({
              role: { connect: { id: role.roleId } },
              assignedByUser: { connect: { id: requestMakerId } },
              scopeMode: role.facilities && role.facilities.length > 0 ? "FACILITY_SET" : "GLOBAL",
              ...(role.facilities &&
                role.facilities.length > 0 && {
                  facilities: {
                    createMany: {
                      data: role.facilities.map((facId) => ({ facilityId: facId })),
                    },
                  },
                }),
            })),
          },
        },
      });

      if (data.professionalDocuments && data.professionalDocuments.length > 0) {
        await tx.userProfessionalDocument.createMany({
          data: data.professionalDocuments.map((doc) => ({
            userId: user.id,
            documentType: doc.documentType as ProfessionalDocumentType,
            documentNumber: doc.documentNumber,
          })),
        });
      }

      return user;
    });
  },

  async activateUser(userId: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        passwordHash: newPasswordHash,
      },
    });
  },

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        cpf: true,
        phone: true,
        isActive: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
    });
  },

  async getUsersByFacilityId(facilityId: string) {
    return prisma.user.findMany({
      where: {
        roles: {
          some: {
            facilities: {
              some: {
                facilityId: facilityId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        cpf: true,
        phone: true,
        isActive: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
    });
  },
};
