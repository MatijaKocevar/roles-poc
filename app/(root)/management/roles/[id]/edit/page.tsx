import EditRolePrivileges from "@/components/EditRolePrivileges";
import prisma from "@/lib/prisma";
import { hasViewPermission } from "../../../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRolePage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;

    const canView = await hasViewPermission("Management Roles");

    if (!canView) {
        redirect("/unauthorized");
    }

    const { id } = await Promise.resolve(params);
    const roleId = parseInt(id, 10);
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { module: true } } },
    });
    const modules = await prisma.module.findMany({
        where: { parentId: null },
        include: { submodules: true },
        orderBy: { name: "asc" },
    });

    if (!role) return <div>Role not found</div>;

    return <EditRolePrivileges role={role} modules={modules} />;
}
