import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function RegulationGroupsPage() {
    const canView = await hasViewPermission("Regulation Groups");

    if (!canView) {
        redirect("/unauthorized");
    }

    const regulationGroups = await prisma.regulationGroup.findMany();

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Regulation Groups</h1>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Portfolio ID</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {regulationGroups.map((group) => (
                        <tr key={group.id}>
                            <td className="border border-gray-300 px-4 py-2">{group.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{group.name}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {group.portfolioId}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <Link
                                    href={`/regulation-groups/${group.id}`}
                                    className="text-blue-500 hover:underline"
                                >
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
