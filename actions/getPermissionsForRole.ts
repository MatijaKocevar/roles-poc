"use server";

import prisma from "@/lib/prisma";

export async function getPermissionsForRole(roleId: string) {
    const permissions = await prisma.permission.findMany({
        where: { roleId: parseInt(roleId) },
    });
    const mapping: {
        [moduleId: number]: {
            canView: boolean;
            canEdit: boolean;
            canCreate: boolean;
            canDelete: boolean;
        };
    } = {};
    permissions.forEach((perm) => {
        mapping[perm.moduleId] = {
            canView: perm.canView,
            canEdit: perm.canEdit,
            canCreate: perm.canCreate,
            canDelete: perm.canDelete,
        };
    });
    return mapping;
}
