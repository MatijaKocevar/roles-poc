import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export default async function PortfolioDetailsPage({ params }: { params: { id: string } }) {
    const canView = await hasViewPermission("Portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    const portfolio = await prisma.portfolio.findUnique({
        where: { id: Number(params.id) },
        include: {
            groups: {
                include: { units: true },
            },
        },
    });

    if (!portfolio) {
        return <div>Portfolio not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold ">{portfolio.name}</h1>
                <Link href="/portfolios" className="text-blue-500 hover:underline">
                    Back to Portfolios
                </Link>
            </div>
            {portfolio.groups.length === 0 ? (
                <p>No regulation groups found.</p>
            ) : (
                portfolio.groups.map((group) => (
                    <div key={group.id} className="mb-6 border p-4 rounded">
                        <h2 className="text-2xl font-semibold mb-2">{group.name}</h2>
                        {group.units.length === 0 ? (
                            <p>No units found in this group.</p>
                        ) : (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Units</h3>
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2">ID</th>
                                            <th className="border border-gray-300 px-4 py-2">
                                                Name
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.units.map((unit) => (
                                            <tr key={unit.id}>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    {unit.id}
                                                </td>
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
                ))
            )}
        </div>
    );
}
