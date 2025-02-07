import Link from "next/link";
import prisma from "@/lib/prisma";
import UserSwitcher from "@/components/UserSwitcher";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const canView = await hasViewPermission("Management Users");

    if (!canView) {
        redirect("/unauthorized");
    }

    const users = await prisma.user.findMany({ include: { roles: true } });
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">ID</th>
                        <th className="py-2 px-4 border">Email</th>
                        <th className="py-2 px-4 border">Roles</th>
                        <th className="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border">{user.id}</td>
                            <td className="py-2 px-4 border">{user.email}</td>
                            <td className="py-2 px-4 border">
                                {user.roles.map((role) => role.name).join(", ")}
                            </td>
                            <td className="py-2 px-4 border">
                                <div className="flex gap-2">
                                    <Link
                                        href={`/management/users/${user.id}/edit`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </Link>
                                    <UserSwitcher userId={user.id} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
