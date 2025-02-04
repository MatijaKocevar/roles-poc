import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearData(): Promise<void> {
    await prisma.permission.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.page.deleteMany({});
}

async function main(): Promise<void> {
    await clearData();

    const pagesData = [
        { name: "Portfolios", subpages: ["Overview", "Management"] },
        { name: "Contracts", subpages: ["Overview", "Management"] },
        { name: "Analytics", subpages: ["Overview", "Reports", "Data Export"] },
        { name: "Assets", subpages: ["Overview", "Management"] },
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
        const mainPage = await prisma.page.create({ data: { name: pageData.name } });
        for (const subpageName of pageData.subpages) {
            await prisma.page.create({ data: { name: subpageName, parentId: mainPage.id } });
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
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
