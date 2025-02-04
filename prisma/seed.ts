import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    const pagesData = [
        { name: "Portfolios", subpages: ["Overview", "Create Portfolio", "Edit Portfolio"] },
        {
            name: "Contracts",
            subpages: ["Overview", "Create Contract", "Renew Contract", "Terminate Contract"],
        },
        { name: "Analytics", subpages: ["Overview", "Reports", "Data Export"] },
        { name: "Assets", subpages: ["Overview", "Upload Assets", "Manage Assets"] },
        {
            name: "Billing & Payments",
            subpages: ["Invoices", "Payment Methods", "Payment History"],
        },
        { name: "Dashboard", subpages: ["Summary", "Notifications", "Activity Log"] },
        { name: "Marketing", subpages: ["Campaigns", "Leads", "Performance"] },
        { name: "Monitoring", subpages: ["System Status", "Logs", "Alerts"] },
        { name: "Security", subpages: ["User Management", "Role Management", "Audit Logs"] },
        { name: "Settings", subpages: ["General", "Preferences", "Integrations"] },
    ];

    for (const pageData of pagesData) {
        const page = await prisma.page.create({ data: { name: pageData.name } });
        for (const subpageName of pageData.subpages) {
            await prisma.page.create({ data: { name: subpageName, parentId: page.id } });
        }
    }

    const allPages = await prisma.page.findMany();

    const rolesData = [
        { name: "Admin", permissions: { canView: true, canEdit: true, canDelete: true } },
        { name: "Editor", permissions: { canView: true, canEdit: true, canDelete: false } },
        { name: "Viewer", permissions: { canView: true, canEdit: false, canDelete: false } },
    ];

    for (const roleData of rolesData) {
        const role = await prisma.role.create({ data: { name: roleData.name } });
        for (const page of allPages) {
            await prisma.permission.create({
                data: {
                    roleId: role.id,
                    pageId: page.id,
                    canView: roleData.permissions.canView,
                    canEdit: roleData.permissions.canEdit,
                    canDelete: roleData.permissions.canDelete,
                },
            });
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
