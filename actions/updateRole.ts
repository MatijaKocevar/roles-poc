"use server";

import prisma from "@/lib/prisma";

export async function updateRole(
    id: string,
    name: string,
    permissions: {
        [moduleId: number]: {
            canView: boolean;
            canEdit: boolean;
            canCreate: boolean;
            canDelete: boolean;
        };
    }
) {
    try {
        const updatedRole = await prisma.role.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name: name,
            },
        });

        // Delete existing permissions for the role
        await prisma.permission.deleteMany({
            where: {
                roleId: parseInt(id),
            },
        });

        // Create new permissions based on the provided data
        for (const moduleId in permissions) {
            const permission = permissions[moduleId];
            await prisma.permission.create({
                data: {
                    roleId: parseInt(id),
                    moduleId: parseInt(moduleId),
                    canView: permission.canView,
                    canEdit: permission.canEdit,
                    canCreate: permission.canCreate,
                    canDelete: permission.canDelete,
                },
            });
        }

        return updatedRole;
    } catch (error) {
        console.error("Error updating role:", error);
        return null;
    }
}
