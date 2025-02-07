import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    // Get the active user record (assumes id=1 for active user)
    const activeUserRecord = await prisma.activeUser.findUnique({ where: { id: 1 } });
    if (!activeUserRecord) {
        return NextResponse.json({ activeUser: null });
    }

    // Fetch user with roles and role permissions, including module relation
    const user = await prisma.user.findUnique({
        where: { id: activeUserRecord.userId },
        include: {
            roles: {
                include: {
                    permissions: {
                        include: { module: true },
                    },
                },
            },
        },
    });

    if (!user) {
        return NextResponse.json({ activeUser: null });
    }

    const transformedRoles = user.roles.map((role) => ({
        ...role,
        permissions: role.permissions.map((perm) => ({
            roleId: perm.roleId,
            moduleSlug: perm.module.slug,
            permission: {
                canView: perm.canView,
                canEdit: perm.canEdit,
                canDelete: perm.canDelete,
                canCreate: perm.canCreate,
            },
        })),
    }));

    const activeUser = { ...user, roles: transformedRoles };

    return NextResponse.json({ activeUser });
}
