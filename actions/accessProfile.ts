"use server";

import prisma from "@/lib/prisma";
import { PermissionType } from "@prisma/client";

export async function getAccessProfile(accessProfileId: string) {
    return await prisma.accessProfile.findUnique({
        where: { id: parseInt(accessProfileId) },
        select: { name: true },
    });
}

export async function createAccessProfile(
    name: string,
    permissions: { [moduleId: number]: PermissionType }
) {
    try {
        const accessProfile = await prisma.accessProfile.create({
            data: { name },
        });

        for (const moduleId in permissions) {
            const perm = permissions[Number(moduleId)];

            await prisma.permission.create({
                data: {
                    accessProfileId: accessProfile.id,
                    moduleId: parseInt(moduleId),
                    permission: perm,
                },
            });
        }

        return accessProfile;
    } catch (error) {
        console.error("Error creating accessProfile:", error);

        throw new Error("Failed to create accessProfile.");
    }
}

export async function updateAccessProfile(
    id: string,
    name: string,
    permissions: { [moduleId: number]: PermissionType }
) {
    try {
        const updatedAccessProfile = await prisma.accessProfile.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        await prisma.permission.deleteMany({
            where: { accessProfileId: parseInt(id) },
        });

        for (const moduleId in permissions) {
            const perm = permissions[Number(moduleId)];

            await prisma.permission.create({
                data: {
                    accessProfileId: parseInt(id),
                    moduleId: parseInt(moduleId),
                    permission: perm,
                },
            });
        }

        return updatedAccessProfile;
    } catch (error) {
        console.error("Error updating accessProfile:", error);

        return null;
    }
}

export async function getPermissionsForAccessProfile(accessProfileId: string) {
    const permissions = await prisma.permission.findMany({
        where: { accessProfileId: parseInt(accessProfileId) },
    });

    const mapping: { [moduleId: number]: PermissionType } = {};

    permissions.forEach((perm) => {
        mapping[perm.moduleId] = perm.permission;
    });

    return mapping;
}

export async function deleteAccessProfile({ accessProfileId }: { accessProfileId: number }) {
    await prisma.permission.deleteMany({
        where: { accessProfileId: accessProfileId },
    });

    await prisma.accessProfile.delete({
        where: { id: accessProfileId },
    });
}
