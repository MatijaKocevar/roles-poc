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
import { getAvailableAssets } from "../../../../actions/asset";

export const dynamic = "force-dynamic";

export default async function RegulationUnitsPage() {
    const canView = await hasViewPermission("assets-regulation-units");
    if (!canView) {
        redirect("/unauthorized");
    }

    const { regulationUnits } = await getAvailableAssets();

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
