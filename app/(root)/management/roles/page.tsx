import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../../lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function RolesListPage() {
    const canView = await hasViewPermission("management-roles");

    if (!canView) {
        redirect("/unauthorized");
    }

    const roles = await prisma.role.findMany();

    return (
        <div className="mx-auto p-4">
            <Link href="/management/roles/create">Create New Role</Link>
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell>{role.id}</TableCell>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>
                                <Link href={`/management/roles/${role.id}/edit`}>View</Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
