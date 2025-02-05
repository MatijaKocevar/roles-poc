import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function RegulationUnitsPage() {
    const canView = await hasViewPermission("Regulation Units");
    if (!canView) {
        redirect("/unauthorized");
    }
    const active = await prisma.activeUser.findUnique({ where: { id: 1 } });
    const activeUserId = active?.userId;
    if (!activeUserId) {
        return <div>No active user found.</div>;
    }

    const units = await prisma.regulationUnit.findMany({
        where: {
            userUnitPermissions: {
                some: {
                    userId: activeUserId,
                    canView: true,
                },
            },
        },
        include: {
            group: {
                select: {
                    id: true,
                    name: true,
                    portfolioId: true,
                },
            },
        },
    });

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Regulation Units</h1>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Group ID</th>
                        <th className="border border-gray-300 px-4 py-2">Portfolio ID</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit) => (
                        <tr key={unit.id}>
                            <td className="border border-gray-300 px-4 py-2">{unit.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{unit.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{unit.group.id}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {unit.group.portfolioId}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <Link
                                    href={`/regulation-units/${unit.id}`}
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
