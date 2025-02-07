import prisma from "@/lib/prisma";

export async function hasViewPermission(moduleName: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
        include: { roles: { include: { permissions: { include: { module: true } } } } },
    });

    if (!user) return false;

    let canView = false;

    user.roles.forEach((role) => {
        role.permissions.forEach((perm) => {
            if (perm.module.name === moduleName && perm.canView) {
                canView = true;
            }
        });
    });

    return canView;
}
