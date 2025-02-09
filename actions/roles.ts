"use server";

import prisma from "@/lib/prisma";

export async function getRole(roleId: string) {
    return await prisma.role.findUnique({
        where: { id: parseInt(roleId) },
        select: { name: true },
    });
}

// Change permissions type to use a single permission value per module.
export async function createRole(
    name: string,
    permissions: { [moduleId: number]: "VIEW" | "MANAGE" }
) {
    try {
        const role = await prisma.role.create({
            data: { name },
        });
        for (const moduleId in permissions) {
            const perm = permissions[Number(moduleId)];
            await prisma.permission.create({
                data: {
                    roleId: role.id,
                    moduleId: parseInt(moduleId),
                    permission: perm,
                },
            });
        }
        return role;
    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Failed to create role.");
    }
}

export async function updateRole(
    id: string,
    name: string,
    permissions: { [moduleId: number]: "VIEW" | "MANAGE" }
) {
    try {
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        // Delete existing permissions for the role.
        await prisma.permission.deleteMany({
            where: { roleId: parseInt(id) },
        });

        // Create new permission records using the new format.
        for (const moduleId in permissions) {
            const perm = permissions[Number(moduleId)];
            await prisma.permission.create({
                data: {
                    roleId: parseInt(id),
                    moduleId: parseInt(moduleId),
                    permission: perm,
                },
            });
        }

        return updatedRole;
    } catch (error) {
        console.error("Error updating role:", error);
        return null;
    }
}

export async function getPermissionsForRole(roleId: string) {
    const permissions = await prisma.permission.findMany({
        where: { roleId: parseInt(roleId) },
    });
    const mapping: { [moduleId: number]: "VIEW" | "MANAGE" } = {};
    permissions.forEach((perm) => {
        mapping[perm.moduleId] = perm.permission;
    });
    return mapping;
}

// Updated deleteRole to first remove associated permissions before deleting the role
export async function deleteRole({ roleId }: { roleId: number }) {
    await prisma.permission.deleteMany({
        where: { roleId },
    });

    await prisma.role.delete({
        where: { id: roleId },
    });
}
