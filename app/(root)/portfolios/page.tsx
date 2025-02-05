import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PortfoliosPage() {
    const canView = await hasViewPermission("Portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    // Get active user from the ActiveUser model.
    const active = await prisma.activeUser.findUnique({ where: { id: 1 } });
    const activeUserId = active?.userId;
    if (!activeUserId) {
        return <div>No active user found.</div>;
    }

    const portfolios = await prisma.portfolio.findMany({
        where: {
            userPortfolioPermissions: {
                some: {
                    userId: activeUserId,
                    canView: true,
                },
            },
        },
    });

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Portfolios</h1>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolios.map((portfolio) => (
                        <tr key={portfolio.id}>
                            <td className="border border-gray-300 px-4 py-2">{portfolio.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{portfolio.name}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <Link
                                    href={`/portfolios/${portfolio.id}`}
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
