import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type PermissionData = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
};

export async function POST(request: Request) {
    const { roleId, permissions } = await request.json();
    const updatePromises = Object.entries(permissions).map(async ([pageId, perms]) => {
        const typedPerms = perms as PermissionData;
        return prisma.permission.update({
            where: { roleId_pageId: { roleId: Number(roleId), pageId: Number(pageId) } },
            data: {
                canView: typedPerms.canView,
                canEdit: typedPerms.canEdit,
                canDelete: typedPerms.canDelete,
                canCreate: typedPerms.canCreate,
            },
        });
    });
    const updated = await Promise.all(updatePromises);
    return NextResponse.json({ message: "Permissions updated", updated });
}
