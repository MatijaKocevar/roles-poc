"use server";

import prisma from "@/lib/prisma";

export async function createRole(
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
        const role = await prisma.role.create({
            data: {
                name: name,
            },
        });

        for (const moduleId in permissions) {
            const permission = permissions[moduleId];
            await prisma.permission.create({
                data: {
                    roleId: role.id,
                    moduleId: parseInt(moduleId),
                    canView: permission.canView,
                    canEdit: permission.canEdit,
                    canCreate: permission.canCreate,
                    canDelete: permission.canDelete,
                },
            });
        }
    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Failed to create role.");
    }
}
