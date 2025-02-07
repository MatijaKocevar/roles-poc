import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function RolesListPage() {
    const canView = await hasViewPermission("Management Roles");

    if (!canView) {
        redirect("/unauthorized");
    }

    const roles = await prisma.role.findMany();

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Roles</h1>
                <Link
                    href="/management/roles/new"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Create New Role
                </Link>
            </div>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">ID</th>
                        <th className="py-2 px-4 border">Role Name</th>
                        <th className="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id}>
                            <td className="py-2 px-4 border">{role.id}</td>
                            <td className="py-2 px-4 border">{role.name}</td>
                            <td className="py-2 px-4 border">
                                <Link
                                    href={`/management/roles/${role.id}/edit`}
                                    className="text-blue-500 hover:underline"
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
