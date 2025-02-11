import { redirect } from "next/navigation";
import Link from "next/link";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getActiveUser } from "../../../../actions/user";
import prisma from "@/lib/prisma";
import { AssetType } from "@prisma/client";
export const dynamic = "force-dynamic";

export default async function RegulationUnitsPage() {
    const canView = await hasViewPermission("assets-regulation-units");
    if (!canView) {
        redirect("/unauthorized");
    }

    const data = await getActiveUser();
    if (!data) {
        redirect("/unauthorized");
    }

    const { activeUser } = data;

    const regulationUnits =
        activeUser.role === "SUPER_ADMIN"
            ? await prisma.regulationUnit.findMany()
            : activeUser.assets.filter((asset) => asset.assetType === AssetType.REGULATION_UNIT);

    if (regulationUnits.length === 0) {
        return <p>No available regulation units.</p>;
    }

    return (
        <div className="mx-auto p-4">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {regulationUnits.map((unit) => (
                        <TableRow key={unit.id}>
                            <TableCell>{unit.id}</TableCell>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell>
                                <Link href={`/assets/regulation-units/${unit.id}`}>
                                    <Button>View</Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
