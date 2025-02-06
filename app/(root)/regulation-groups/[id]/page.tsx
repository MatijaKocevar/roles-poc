import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export const dynamic = "force-dynamic";

export default async function RegulationGroupDetailsPage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;

    const canView = await hasViewPermission("Regulation Groups");
    if (!canView) {
        redirect("/unauthorized");
    }

    const group = await prisma.regulationGroup.findUnique({
        where: { id: Number(params.id) },
        include: { units: true },
    });

    if (!group) {
        return <div>Regulation group not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <Link href="/regulation-groups" className="text-blue-500 hover:underline">
                    Back to Regulation Groups
                </Link>
            </div>
            {group.units.length === 0 ? (
                <p>No units found in this group.</p>
            ) : (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Units</h2>
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">ID</th>
                                <th className="border border-gray-300 px-4 py-2">Name</th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.units.map((unit) => (
                                <tr key={unit.id}>
                                    <td className="border border-gray-300 px-4 py-2">{unit.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {unit.name}
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
            )}
        </div>
    );
}
