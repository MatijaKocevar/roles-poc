"use server";

import prisma from "@/lib/prisma";

export async function getAccessProfile(accessProfileId: string) {
    return await prisma.accessProfile.findUnique({
        where: { id: parseInt(accessProfileId) },
        select: { name: true },
    });
}

// Change permissions type to use a single permission value per module.
export async function createAccessProfile(
    name: string,
    permissions: { [moduleId: number]: "VIEW" | "MANAGE" }
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
    permissions: { [moduleId: number]: "VIEW" | "MANAGE" }
) {
    try {
        const updatedAccessProfile = await prisma.accessProfile.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        // Delete existing permissions for the accessProfile.
        await prisma.permission.deleteMany({
            where: { accessProfileId: parseInt(id) },
        });

        // Create new permission records using the new format.
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
    const mapping: { [moduleId: number]: "VIEW" | "MANAGE" } = {};
    permissions.forEach((perm) => {
        mapping[perm.moduleId] = perm.permission;
    });
    return mapping;
}

// Updated deleteAccessProfile to remove associated permissions and use the new model name.
export async function deleteAccessProfile({ accessProfileId }: { accessProfileId: number }) {
    await prisma.permission.deleteMany({
        where: { accessProfileId: accessProfileId },
    });

    await prisma.accessProfile.delete({
        where: { id: accessProfileId },
    });
}
