import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearData(): Promise<void> {
    // Clear dependent records in proper order.
    await prisma.permission.deleteMany({});
    await prisma.userPortfolioPermission.deleteMany({});
    await prisma.userGroupPermission.deleteMany({});
    await prisma.userUnitPermission.deleteMany({});
    await prisma.activeUser.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.regulationUnit.deleteMany({});
    await prisma.regulationGroup.deleteMany({});
    await prisma.portfolio.deleteMany({});
}

async function main(): Promise<void> {
    await clearData();

    // --- Seed for Pages (for sidebar) ---
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

    for (const pageData of pagesData) {
        const mainPage = await prisma.page.create({ data: { name: pageData.name } });
        for (const subpageName of pageData.subpages) {
            await prisma.page.create({ data: { name: subpageName, parentId: mainPage.id } });
        }
    }
    const allPages = await prisma.page.findMany();

    // --- Seed Global Roles & Global Permissions ---
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
        // Create global permissions for each page for this role.
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

    // --- Create Users ---
    // First user is always Super_Admin.
    const superAdminRole = createdRoles.find((r) => r.name === "Super_Admin")!;
    await prisma.user.create({
        data: {
            email: "user0@example.com",
            roles: { connect: { id: superAdminRole.id } },
        },
    });
    // Create nine additional users randomly assigned to one of the roles.
    for (let i = 1; i <= 9; i++) {
        const randomIndex = Math.floor(Math.random() * createdRoles.length);
        const assignedRole = createdRoles[randomIndex];
        await prisma.user.create({
            data: {
                email: `user${i}@example.com`,
                roles: { connect: { id: assignedRole.id } },
            },
        });
    }

    // --- Seed Portfolios, Regulation Groups, and Regulation Units ---
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

    // --- Directly Assign User Permissions Based on Global Role ---
    const allUsers = await prisma.user.findMany({ include: { roles: true } });
    const allPortfolios = await prisma.portfolio.findMany();
    const allGroups = await prisma.regulationGroup.findMany();
    const allUnits = await prisma.regulationUnit.findMany();

    for (const u of allUsers) {
        const userRoleName = u.roles[0].name;
        if (userRoleName === "Super_Admin") {
            // Super_Admin: assign full permissions on all portfolios, groups, and units.
            for (const portfolio of allPortfolios) {
                await prisma.userPortfolioPermission.create({
                    data: {
                        userId: u.id,
                        portfolioId: portfolio.id,
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canCreate: true,
                    },
                });
            }
            for (const group of allGroups) {
                await prisma.userGroupPermission.create({
                    data: {
                        userId: u.id,
                        groupId: group.id,
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canCreate: true,
                    },
                });
            }
            for (const unit of allUnits) {
                await prisma.userUnitPermission.create({
                    data: {
                        userId: u.id,
                        unitId: unit.id,
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canCreate: true,
                    },
                });
            }
        } else if (userRoleName === "Admin") {
            // Admin: assign full permissions for one random portfolio.
            const randomPortfolio = allPortfolios[Math.floor(Math.random() * allPortfolios.length)];
            await prisma.userPortfolioPermission.create({
                data: {
                    userId: u.id,
                    portfolioId: randomPortfolio.id,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canCreate: true,
                },
            });
            const groupsInPortfolio = allGroups.filter((g) => g.portfolioId === randomPortfolio.id);
            for (const group of groupsInPortfolio) {
                await prisma.userGroupPermission.create({
                    data: {
                        userId: u.id,
                        groupId: group.id,
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canCreate: true,
                    },
                });
                const unitsInGroup = allUnits.filter((unit) => unit.groupId === group.id);
                for (const unit of unitsInGroup) {
                    await prisma.userUnitPermission.create({
                        data: {
                            userId: u.id,
                            unitId: unit.id,
                            canView: true,
                            canEdit: true,
                            canDelete: true,
                            canCreate: true,
                        },
                    });
                }
            }
        } else if (userRoleName === "Manager") {
            // Manager: assign permissions for one random portfolio with canDelete false.
            const randomPortfolio = allPortfolios[Math.floor(Math.random() * allPortfolios.length)];
            await prisma.userPortfolioPermission.create({
                data: {
                    userId: u.id,
                    portfolioId: randomPortfolio.id,
                    canView: true,
                    canEdit: true,
                    canDelete: false,
                    canCreate: true,
                },
            });
            const groupsInPortfolio = allGroups.filter((g) => g.portfolioId === randomPortfolio.id);
            for (const group of groupsInPortfolio) {
                await prisma.userGroupPermission.create({
                    data: {
                        userId: u.id,
                        groupId: group.id,
                        canView: true,
                        canEdit: true,
                        canDelete: false,
                        canCreate: true,
                    },
                });
                const unitsInGroup = allUnits.filter((unit) => unit.groupId === group.id);
                for (const unit of unitsInGroup) {
                    await prisma.userUnitPermission.create({
                        data: {
                            userId: u.id,
                            unitId: unit.id,
                            canView: true,
                            canEdit: true,
                            canDelete: false,
                            canCreate: true,
                        },
                    });
                }
            }
        } else if (userRoleName === "Basic_User") {
            // Basic_User: assign only view permission for one random unit.
            const randomUnit = allUnits[Math.floor(Math.random() * allUnits.length)];
            await prisma.userUnitPermission.create({
                data: {
                    userId: u.id,
                    unitId: randomUnit.id,
                    canView: true,
                    canEdit: false,
                    canDelete: false,
                    canCreate: false,
                },
            });
        }
    }

    // --- Set Active User to the First User ---
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
        await prisma.activeUser.upsert({
            where: { id: 1 },
            update: { userId: firstUser.id },
            create: { id: 1, userId: firstUser.id },
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
