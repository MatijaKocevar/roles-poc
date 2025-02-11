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
import { AssetType } from "@prisma/client";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
    const canView = await hasViewPermission("assets-portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    const data = await getActiveUser();
    if (!data) {
        redirect("/unauthorized");
    }

    const { activeUser } = data;

    const portfolios =
        activeUser.role === "SUPER_ADMIN"
            ? await prisma.portfolio.findMany()
            : activeUser.assets.filter((asset) => asset.assetType === AssetType.PORTFOLIO);

    if (portfolios?.length === 0) {
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
                    {portfolios?.map((portfolio) => (
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
