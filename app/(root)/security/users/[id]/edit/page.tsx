import EditUserRoles from "@/components/EditUserRoles";
import prisma from "@/lib/prisma";
import { hasViewPermission } from "../../../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const canView = await hasViewPermission("User Management");

    if (!canView) {
        redirect("/unauthorized");
    }

    const userId = Number(params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: true },
    });
    const roles = await prisma.role.findMany();

    if (!user) return <div>User not found</div>;

    return <EditUserRoles user={user} roles={roles} />;
}
