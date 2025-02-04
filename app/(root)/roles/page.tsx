import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function RolesListPage() {
    const roles = await prisma.role.findMany();

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Roles</h1>
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
                                    href={`/roles/${role.id}/edit`}
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
