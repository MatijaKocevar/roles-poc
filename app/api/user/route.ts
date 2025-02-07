import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("id"));
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: { permissions: { include: { module: true } } },
            },
        },
    });

    if (!user) {
        return NextResponse.error();
    }

    let transformedUser = null;
    transformedUser = {
        id: user.id,
        email: user.email,
        roles: user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions.map((perm) => ({
                roleId: role.id,
                moduleId: perm.moduleId,
                moduleName: perm.module.name,
                permission: {
                    canView: perm.canView,
                    canEdit: perm.canEdit,
                    canDelete: perm.canDelete,
                    canCreate: perm.canCreate,
                },
            })),
        })),
    };

    return NextResponse.json(transformedUser);
}
