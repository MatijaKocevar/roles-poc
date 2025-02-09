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
import { Button } from "../../../../components/ui/button";
import DeleteRoleButton from "./DeleteRoleButton";

export const dynamic = "force-dynamic";

export default async function RolesListPage() {
    const canView = await hasViewPermission("management-roles");

    if (!canView) {
        redirect("/unauthorized");
    }

    const roles = await prisma.role.findMany();

    return (
        <div className="mx-auto p-4">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-60">
                            <span className="mr-8">Actions</span>
                            <Link href="/management/roles/create">
                                <Button className="bg-blue-600">Create New Role</Button>
                            </Link>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell>{role.id}</TableCell>
                            <TableCell>{role.name}</TableCell>
                            <TableCell className="flex flex-row justify-around gap-2">
                                <Link href={`/management/roles/${role.id}/edit`}>
                                    <Button>View</Button>
                                </Link>
                                <DeleteRoleButton roleId={role.id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
