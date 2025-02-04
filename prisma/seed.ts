import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearData(): Promise<void> {
    await prisma.permission.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.page.deleteMany({});
}

async function main(): Promise<void> {
    await clearData();

    const pagesData = [
        {
            name: "Portfolios",
            subpages: ["Overview", "Create Portfolio", "Edit Portfolio"],
        },
        {
            name: "Contracts",
            subpages: ["Overview", "Create Contract", "Renew Contract", "Terminate Contract"],
        },
        {
            name: "Analytics",
            subpages: ["Overview", "Reports", "Data Export"],
        },
        {
            name: "Assets",
            subpages: ["Overview", "Upload Assets", "Manage Assets"],
        },
        {
            name: "Billing & Payments",
            subpages: ["Invoices", "Payment Methods", "Payment History"],
        },
        {
            name: "Dashboard",
            subpages: ["Summary", "Notifications", "Activity Log"],
        },
        {
            name: "Marketing",
            subpages: ["Campaigns", "Leads", "Performance"],
        },
        {
            name: "Monitoring",
            subpages: ["System Status", "Logs", "Alerts"],
        },
        {
            name: "Security",
            subpages: ["User Management", "Role Management", "Audit Logs"],
        },
        {
            name: "Settings",
            subpages: ["General", "Preferences", "Integrations"],
        },
    ];

    // Create main pages and their subpages
    for (const pageData of pagesData) {
        const mainPage = await prisma.page.create({ data: { name: pageData.name } });
        for (const subpageName of pageData.subpages) {
            await prisma.page.create({
                data: { name: subpageName, parentId: mainPage.id },
            });
        }
    }

    const allPages = await prisma.page.findMany();

    const rolesData = [
        { name: "Admin", permissions: { canView: true, canEdit: true, canDelete: true } },
        { name: "Editor", permissions: { canView: true, canEdit: true, canDelete: false } },
        { name: "Viewer", permissions: { canView: true, canEdit: false, canDelete: false } },
    ];

    const createdRoles = [];
    for (const roleData of rolesData) {
        const role = await prisma.role.create({ data: { name: roleData.name } });
        createdRoles.push(role);
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

    // Create 10 users, each assigned a random role
    for (let i = 1; i <= 10; i++) {
        const randomIndex = Math.floor(Math.random() * createdRoles.length);
        const assignedRole = createdRoles[randomIndex];
        await prisma.user.create({
            data: {
                email: `user${i}@example.com`,
                roles: {
                    connect: { id: assignedRole.id },
                },
            },
        });
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
