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
import DeleteRoleButton from "./DeleteAccessProfileButton";

export const dynamic = "force-dynamic";

export default async function RolesListPage() {
    const canView = await hasViewPermission("management-accessProfiles");

    if (!canView) {
        redirect("/unauthorized");
    }

    const accessProfiles = await prisma.accessProfile.findMany();

    return (
        <div className="mx-auto p-4">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-60">
                            <span className="mr-8">Actions</span>
                            <Link href="/management/accessProfiles/create">
                                <Button className="bg-blue-600">Create New Role</Button>
                            </Link>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accessProfiles.map((accessProfile) => (
                        <TableRow key={accessProfile.id}>
                            <TableCell>{accessProfile.id}</TableCell>
                            <TableCell>{accessProfile.name}</TableCell>
                            <TableCell className="flex flex-row justify-around gap-2">
                                <Link href={`/management/access-profiles/${accessProfile.id}/edit`}>
                                    <Button>View</Button>
                                </Link>
                                <DeleteRoleButton accessProfileId={accessProfile.id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
