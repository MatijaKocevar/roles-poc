import prisma from "@/lib/prisma";

export async function hasViewPermission(moduleSlug: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
        include: { roles: { include: { permissions: { include: { module: true } } } } },
    });

    if (!user) return false;

    let canView = false;

    user.roles.forEach((role) => {
        role.permissions.forEach((perm) => {
            if (perm.module.slug === moduleSlug && perm.canView) {
                canView = true;
            }
        });
    });

    return canView;
}
