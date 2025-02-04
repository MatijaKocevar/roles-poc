import EditRolePrivileges from "@/components/EditRolePrivileges";
import prisma from "@/lib/prisma";

export default async function EditRolePage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);
    const roleId = parseInt(id, 10);
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { page: true } } },
    });
    const pages = await prisma.page.findMany({
        where: { parentId: null },
        include: { subpages: true },
    });

    if (!role) return <div>Role not found</div>;

    return <EditRolePrivileges role={role} pages={pages} />;
}
