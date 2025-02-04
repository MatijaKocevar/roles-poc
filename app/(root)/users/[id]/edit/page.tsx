import EditUserRoles from "@/components/EditUserRoles";
import prisma from "@/lib/prisma";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const userId = Number(params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: true },
    });
    const roles = await prisma.role.findMany();

    if (!user) return <div>User not found</div>;

    return <EditUserRoles user={user} roles={roles} />;
}
