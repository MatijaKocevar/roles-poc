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

export default async function PortfoliosPage() {
    const canView = await hasViewPermission("assets-portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    const { portfolios } = await getAvailableAssets();

    if (portfolios.length === 0) {
        return <p>No available portfolios.</p>;
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
                    {portfolios.map((portfolio) => (
                        <TableRow key={portfolio.id}>
                            <TableCell>{portfolio.id}</TableCell>
                            <TableCell>{portfolio.name}</TableCell>
                            <TableCell>
                                <Link href={`/assets/portfolios/${portfolio.id}`}>
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
