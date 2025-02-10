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
import { getUsersList } from "../../../../actions/user";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const canView = await hasViewPermission("management-users");

    if (!canView) redirect("/unauthorized");

    const activeUserRecord = await prisma.activeUser.findUnique({ where: { id: 1 } });

    if (!activeUserRecord?.userId) return <div>No active user.</div>;

    const users = await getUsersList(activeUserRecord.userId);

    const activeUser = await prisma.user.findUnique({
        where: { id: activeUserRecord.userId },
        select: { id: true, role: true, companyId: true },
    });

    if (!activeUser) return <div>Active user not found.</div>;

    return (
        <div className="mx-auto p-4">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>
                                {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.company?.name || "N/A"}</TableCell>
                            <TableCell>{formatUserRole(user.role)}</TableCell>
                            <TableCell>
                                {activeUser.role !== "UNIT_MANAGER" && (
                                    <Link href={`/management/users/${user.id}/edit`}>
                                        <Button>View</Button>
                                    </Link>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function formatUserRole(role: string): string {
    switch (role) {
        case "SUPER_ADMIN":
            return "Super Admin";
        case "COMPANY_MANAGER":
            return "Company Manager";
        case "PORTFOLIO_MANAGER":
            return "Portfolio Manager";
        case "REG_GROUP_MANAGER":
            return "Regulation Group Manager";
        case "UNIT_MANAGER":
            return "Unit Manager";
        default:
            return "N/A";
    }
}
