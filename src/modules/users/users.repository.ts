import type { Prisma } from "../../generated/prisma/client";
import type { ProfessionalDocumentType } from "../../generated/prisma/enums";
import { prisma } from "../../shared/db/prisma";
import { forbidden } from "../../shared/errors/AppError";
import type {
  UpdateUserPayload,
  UserDetailPayload,
  UserEditData,
} from "../../shared/types/api.contracts";
import { formatDate, formatToPatternDate } from "../../shared/utils/formatters";
import type { CreateUserInput } from "./users.schema";

const detailQueryIncludes = {
  roles: {
    include: {
      facilities: {
        include: {
          facility: true,
        },
      },
      role: true,
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  },
  professionalDocuments: true,
} as const;

const editQueryIncludes = {
  roles: {
    include: {
      facilities: {
        include: {
          facility: {
            include: {
              city: true,
            },
          },
        },
      },
      role: true,
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  },
  professionalDocuments: true,
} as const;

type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof detailQueryIncludes;
}>;

type UserWithRelationsForEdit = Prisma.UserGetPayload<{
  include: typeof editQueryIncludes;
}>;

function mapToUserDetail(user: UserWithRelations): UserDetailPayload {
  return {
    fullName: user.fullName,
    email: user.email,
    cpf: user.cpf,
    birthDate: formatToPatternDate(user.birthDate),
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
      permissionNames: userRole.permissions.map((p) => p.permission.displayName),
    })),
    professionalDocuments: user.professionalDocuments.map((doc) => ({
      documentType: doc.documentType as ProfessionalDocumentType,
      documentNumber: doc.documentNumber,
      issuer: doc.issuer ?? undefined,
      issuerState: doc.issuerState ?? undefined,
      issuedAt: doc.issuedAt ? formatToPatternDate(doc.issuedAt) : undefined,
      expiresAt: doc.expiresAt ? formatToPatternDate(doc.expiresAt) : undefined,
      isPrimary: doc.isPrimary,
      isActive: doc.isActive,
      notes: doc.notes ?? undefined,
    })),
  };
}

function mapToUserEditData(user: UserWithRelationsForEdit): UserEditData {
  return {
    fullName: user.fullName,
    email: user.email,
    cpf: user.cpf,
    birthDate: formatToPatternDate(user.birthDate),
    phone: user.phone ?? undefined,
    zipCode: user.zipCode ?? undefined,
    streetAddress: user.streetAddress ?? undefined,
    number: user.number ?? undefined,
    additionalInfo: user.additionalInfo ?? undefined,
    neighborhood: user.neighborhood ?? undefined,
    addressCity: user.addressCity ?? undefined,
    state: user.state ?? undefined,
    roles: user.roles.map((userRole) => ({
      roleId: userRole.role.id,
      roleName: userRole.role.displayName,
      facilities: userRole.facilities.map((f) => f.facility.name),
      permissionNames: userRole.permissions.map((p) => p.permission.displayName),
      facilityDetails: userRole.facilities.map((f) => ({
        id: f.facility.id,
        name: f.facility.name,
        cityId: f.facility.cityId ?? undefined,
        cityName: f.facility.city?.name ?? undefined,
      })),
      permissionDetails: userRole.permissions.map((p) => ({
        id: p.permission.id,
        name: p.permission.name,
        displayName: p.permission.displayName,
      })),
    })),
    professionalDocuments: user.professionalDocuments.map((doc) => ({
      documentType: doc.documentType as ProfessionalDocumentType,
      documentNumber: doc.documentNumber,
      issuer: doc.issuer ?? undefined,
      issuerState: doc.issuerState ?? undefined,
      issuedAt: doc.issuedAt ? formatToPatternDate(doc.issuedAt) : undefined,
      expiresAt: doc.expiresAt ? formatToPatternDate(doc.expiresAt) : undefined,
      isPrimary: doc.isPrimary,
      isActive: doc.isActive,
      notes: doc.notes ?? undefined,
    })),
  };
}

export const usersRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
        isDeleted: { not: true },
      },
    });
  },

  async findByCpf(cpf: string) {
    return prisma.user.findUnique({
      where: {
        cpf,
        isDeleted: { not: true },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
        isDeleted: { not: true },
      },
    });
  },

  async findBasicUserDataById(id: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
        isDeleted: { not: true },
      },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async findBasicUserDataByCpf(cpf: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: {
        cpf,
        isDeleted: { not: true },
      },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async findBasicUserDataByEmail(email: string): Promise<UserDetailPayload | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
        isDeleted: { not: true },
      },
      include: detailQueryIncludes,
    });
    return user ? mapToUserDetail(user) : null;
  },

  async findUserEditDataById(id: string): Promise<UserEditData | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
        isDeleted: { not: true },
      },
      include: editQueryIncludes,
    });
    return user ? mapToUserEditData(user) : null;
  },

  async getRolePermissions(roleIds: string[]) {
    return prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
      },
      include: {
        permission: true,
        role: {
          select: { category: true },
        },
      },
    });
  },

  async findRoleById(roleId: string) {
    return prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
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
      where: {
        id: userId,
        isDeleted: { not: true },
      },
      select: {
        roles: {
          where: { isActive: true },
          select: {
            permissions: {
              select: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const activePermissions = new Set<string>();
    for (const userRole of user.roles) {
      for (const urp of userRole.permissions) {
        activePermissions.add(urp.permission.name);
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
        },
      });

      for (const role of data.roles) {
        const userRole = await tx.userRole.create({
          data: {
            user: { connect: { id: user.id } },
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
          },
        });

        if (role.permissionIds && role.permissionIds.length > 0) {
          await tx.userRolePermission.createMany({
            data: role.permissionIds.map((permId) => ({
              userRoleId: userRole.id,
              permissionId: permId,
            })),
          });
        }
      }

      if (data.professionalDocuments && data.professionalDocuments.length > 0) {
        await tx.userProfessionalDocument.createMany({
          data: data.professionalDocuments.map((doc) => ({
            userId: user.id,
            documentType: doc.documentType as ProfessionalDocumentType,
            documentNumber: doc.documentNumber,
            issuer: doc.issuer ?? null,
            issuerState: doc.issuerState ?? null,
            issuedAt: doc.issuedAt
              ? typeof doc.issuedAt === "string"
                ? formatDate(doc.issuedAt)
                : doc.issuedAt
              : null,
            expiresAt: doc.expiresAt
              ? typeof doc.expiresAt === "string"
                ? formatDate(doc.expiresAt)
                : doc.expiresAt
              : null,
            isPrimary: doc.isPrimary ?? false,
            isActive: doc.isActive ?? true,
            notes: doc.notes ?? null,
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

  async getAllUsers(activeFacilityId: string, isPrivilegedCaller: boolean) {
    return prisma.user.findMany({
      where: {
        isDeleted: { not: true },
        ...(activeFacilityId !== "ALL" && {
          roles: {
            some: {
              isActive: true,
              OR: [
                { scopeMode: "GLOBAL" },
                {
                  scopeMode: "FACILITY_SET",
                  facilities: {
                    some: { facilityId: activeFacilityId },
                  },
                },
              ],
            },
          },
        }),
        ...(!isPrivilegedCaller && {
          NOT: {
            roles: {
              some: {
                isActive: true,
                role: {
                  governanceLevel: { in: ["ROOT", "SUPER_ADMIN"] },
                },
              },
            },
          },
        }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        cpf: true,
        phone: true,
        isActive: true,
        roles: {
          where: { isActive: true },
          select: {
            role: true,
          },
        },
      },
    });
  },

  async getUsersByFacilityId(facilityId: string, isPrivilegedCaller: boolean) {
    return prisma.user.findMany({
      where: {
        isDeleted: { not: true },
        roles: {
          some: {
            isActive: true,
            OR: [
              { scopeMode: "GLOBAL" },
              {
                scopeMode: "FACILITY_SET",
                facilities: { some: { facilityId } },
              },
            ],
          },
        },
        ...(!isPrivilegedCaller && {
          NOT: {
            roles: {
              some: {
                isActive: true,
                role: {
                  governanceLevel: { in: ["ROOT", "SUPER_ADMIN"] },
                },
              },
            },
          },
        }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        cpf: true,
        phone: true,
        isActive: true,
        roles: {
          where: { isActive: true },
          select: {
            role: true,
          },
        },
      },
    });
  },

  async updateUserData(id: string, data: UpdateUserPayload, requestMakerId: string) {
    return prisma.$transaction(async (tx) => {
      const parsedBirthDate = formatDate(data.birthDate);

      const basicDataUpdate = {
        fullName: data.fullName,
        email: data.email,
        birthDate: parsedBirthDate,
        phone: data.phone ?? null,
        zipCode: data.zipCode ?? null,
        streetAddress: data.streetAddress ?? null,
        number: data.number ?? null,
        additionalInfo: data.additionalInfo ?? null,
        neighborhood: data.neighborhood ?? null,
        addressCity: data.addressCity ?? null,
        state: data.state ?? null,
      };

      const isTargetRoot = await tx.userRole.findFirst({
        where: {
          userId: id,
          role: {
            governanceLevel: "ROOT",
          },
          isActive: true,
        },
      });

      if (isTargetRoot) {
        if (id !== requestMakerId) {
          throw forbidden(
            "Apenas o próprio usuário ROOT pode atualizar seus dados básicos.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        await tx.user.update({
          where: { id: id },
          data: basicDataUpdate,
        });

        return { message: "Apenas os Dados Pessoais, Endereço e Documentação foram atualizados." };
      }

      await tx.user.update({
        where: { id: id },
        data: basicDataUpdate,
      });

      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      if (data.roles && data.roles.length > 0) {
        for (const role of data.roles) {
          const userRole = await tx.userRole.create({
            data: {
              user: { connect: { id: id } },
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
            },
          });

          if (role.permissionIds && role.permissionIds.length > 0) {
            await tx.userRolePermission.createMany({
              data: role.permissionIds.map((permId) => ({
                userRoleId: userRole.id,
                permissionId: permId,
              })),
            });
          }
        }
      }

      await tx.userProfessionalDocument.deleteMany({
        where: { userId: id },
      });

      if (data.professionalDocuments && data.professionalDocuments.length > 0) {
        await tx.userProfessionalDocument.createMany({
          data: data.professionalDocuments.map((doc) => ({
            userId: id,
            documentType: doc.documentType as ProfessionalDocumentType,
            documentNumber: doc.documentNumber,
            issuer: doc.issuer ?? null,
            issuerState: doc.issuerState ?? null,
            issuedAt: doc.issuedAt
              ? typeof doc.issuedAt === "string"
                ? formatDate(doc.issuedAt)
                : doc.issuedAt
              : null,
            expiresAt: doc.expiresAt
              ? typeof doc.expiresAt === "string"
                ? formatDate(doc.expiresAt)
                : doc.expiresAt
              : null,
            isPrimary: doc.isPrimary ?? false,
            isActive: doc.isActive ?? true,
            notes: doc.notes ?? null,
          })),
        });
      }

      return { message: "Usuário atualizado com sucesso." };
    });
  },

  async removeUser(targetId: string, requestMakerId: string) {
    return await prisma.user.update({
      where: { id: targetId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        deletedByUserId: requestMakerId,
      },
    });
  },

  async deactivateUser(targetId: string) {
    return await prisma.user.update({
      where: { id: targetId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  },

  async reactivateUser(targetId: string) {
    return await prisma.user.update({
      where: { id: targetId },
      data: {
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedByUserId: null,
        updatedAt: new Date(),
      },
    });
  },
};
