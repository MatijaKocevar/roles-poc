import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { hasViewPermission } from "../../../../../actions/hasViewPermissions";

export const dynamic = "force-dynamic";

export default async function RegulationUnitDetailsPage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;

    const canView = await hasViewPermission("assets-regulation-units");
    if (!canView) {
        redirect("/unauthorized");
    }

    const unit = await prisma.regulationUnit.findUnique({
        where: { id: Number(params.id) },
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

    if (!unit) {
        return <div>Regulation unit not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Regulation Unit: {unit.name}</h1>
                <Link
                    href={`/assets/regulation-groups/${unit.group.id}`}
                    className="text-blue-500 hover:underline"
                >
                    Back to Group
                </Link>
            </div>
            <div className="mb-4">
                <p>
                    <span className="font-semibold">Unit ID:</span> {unit.id}
                </p>
                <p>
                    <span className="font-semibold">Group:</span> {unit.group.name}
                </p>
                <p>
                    <span className="font-semibold">Portfolio ID:</span> {unit.group.portfolioId}
                </p>
            </div>
        </div>
    );
}
