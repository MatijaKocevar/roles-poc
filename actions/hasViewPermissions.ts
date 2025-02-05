import prisma from "@/lib/prisma";

export async function hasViewPermission(pageName: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
        include: { roles: { include: { permissions: { include: { page: true } } } } },
    });

    if (!user) return false;

    let canView = false;

    user.roles.forEach((role) => {
        role.permissions.forEach((perm) => {
            if (perm.page.name === pageName && perm.canView) {
                canView = true;
            }
        });
    });

    return canView;
}
