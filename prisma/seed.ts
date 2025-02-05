import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearData(): Promise<void> {
    await prisma.permission.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.regulationUnit.deleteMany({});
    await prisma.regulationGroup.deleteMany({});
    await prisma.portfolio.deleteMany({});
}

async function main(): Promise<void> {
    await clearData();

    const pagesData = [
        {
            name: "Billing & Payments",
            subpages: ["Invoices", "Payment Methods", "Payment History"],
        },
        {
            name: "Contracts",
            subpages: ["Overview", "Manage Contracts"],
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
            name: "Portfolios",
            subpages: [],
        },
        {
            name: "Regulation Groups",
            subpages: [],
        },
        {
            name: "Regulation Units",
            subpages: [],
        },
        {
            name: "Security",
            subpages: ["User Management", "Role Management", "Audit Logs"],
        },
        {
            name: "Settings",
            subpages: ["General", "Preferences", "Integrations"],
        },
        {
            name: "System Settings",
            subpages: [],
        },
    ];

    // Create pages and subpages as before
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
        {
            name: "Super_Admin",
            permissions: { canView: true, canEdit: true, canDelete: true, canCreate: true },
        },
        {
            name: "Admin",
            permissions: { canView: true, canEdit: true, canDelete: true, canCreate: true },
        },
        {
            name: "Manager",
            permissions: { canView: true, canEdit: true, canDelete: false, canCreate: true },
        },
        {
            name: "Basic_User",
            permissions: { canView: true, canEdit: false, canDelete: false, canCreate: false },
        },
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
                    canCreate: roleData.permissions.canCreate,
                },
            });
        }
    }

    await prisma.user.create({
        data: {
            email: `user0@example.com`,
            roles: {
                connect: { id: createdRoles[0].id },
            },
        },
    });

    for (let i = 1; i <= 9; i++) {
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

    const portfoliosData = [
        {
            name: "Portfolio A",
            groups: [
                { name: "Group A1", units: ["Unit A1-1", "Unit A1-2"] },
                { name: "Group A2", units: ["Unit A2-1"] },
            ],
        },
        {
            name: "Portfolio B",
            groups: [{ name: "Group B1", units: ["Unit B1-1", "Unit B1-2", "Unit B1-3"] }],
        },
    ];

    for (const pData of portfoliosData) {
        const portfolio = await prisma.portfolio.create({ data: { name: pData.name } });
        for (const groupData of pData.groups) {
            const regGroup = await prisma.regulationGroup.create({
                data: { name: groupData.name, portfolioId: portfolio.id },
            });
            for (const unitName of groupData.units) {
                await prisma.regulationUnit.create({
                    data: { name: unitName, groupId: regGroup.id },
                });
            }
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
