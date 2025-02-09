import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function resetDatabase(): Promise<void> {
    // WARNING: This drops and recreates the public schema. Use with caution.
    await prisma.$executeRaw`DROP SCHEMA public CASCADE;`;
    await prisma.$executeRaw`CREATE SCHEMA public;`;
    // Reapply schema (ensuring tables exist)
    execSync("npx prisma db push", { stdio: "inherit" });
}

async function clearData(): Promise<void> {
    // Clear records in proper order.
    await prisma.userAsset.deleteMany({});
    await prisma.roleAsset.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.activeUser.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.regulationUnit.deleteMany({});
    await prisma.regulationGroup.deleteMany({});
    await prisma.portfolio.deleteMany({});
}

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
}

async function safeCreateUserAsset(data: { userId: number; assetId: number; assetType: string }) {
    try {
        await prisma.userAsset.create({ data });
    } catch (e: any) {
        if (e.code !== "P2002") throw e;
    }
}

async function main(): Promise<void> {
    // Reset database schema and clear data before seeding.
    await resetDatabase();
    await clearData();

    // --- Create Companies ---
    const companies = await Promise.all([
        prisma.company.create({ data: { name: "Company A" } }),
        prisma.company.create({ data: { name: "Company B" } }),
    ]);

    // --- Seed for Modules (for sidebar) ---
    const modulesData = [
        { name: "Trading", submodules: ["Overview", "History", "Autobidder"] },
        { name: "Models", submodules: ["Optimization", "Activation"] },
        { name: "Archive", submodules: ["Realtime"] },
        { name: "Management", submodules: ["Users", "Roles", "Companies"] },
        { name: "Contracts", submodules: ["Overview", "History"] },
        { name: "Reports", submodules: ["Settlements", "Logs"] },
        { name: "System", submodules: ["Overview", "Settings"] },
    ];

    for (const moduleData of modulesData) {
        const mainModule = await prisma.module.create({
            data: { name: moduleData.name, slug: generateSlug(moduleData.name) },
        });
        for (const submodule of moduleData.submodules) {
            await prisma.module.create({
                data: {
                    name: submodule,
                    slug: mainModule.slug + "-" + generateSlug(submodule),
                    parentId: mainModule.id,
                },
            });
        }
    }
    const allModules = await prisma.module.findMany();

    // --- Seed Scopes (instead of global roles) & Permissions ---
    const createdRoles = [];
    for (const moduleData of modulesData) {
        // Create main module scope and permission
        const mainModule = allModules.find(
            (m) => m.name === moduleData.name && m.parentId === null
        );
        let mainRole = null;
        if (mainModule) {
            mainRole = await prisma.role.create({ data: { name: moduleData.name } });
            createdRoles.push(mainRole);
            await prisma.permission.create({
                data: {
                    roleId: mainRole.id,
                    moduleId: mainModule.id,
                    permission: "MANAGE",
                },
            });
        }
        // Create submodule scopes and permissions.
        // For each submodule, create a role with permissions on both the main module and the submodule.
        for (const submodule of moduleData.submodules) {
            const subMod = allModules.find(
                (m) => m.name === submodule && m.parentId === mainModule?.id
            );
            if (subMod && mainModule) {
                const subRole = await prisma.role.create({
                    data: { name: `${moduleData.name} - ${submodule}` },
                });
                createdRoles.push(subRole);
                // Grant MANAGE permission on both the main module and the submodule.
                await prisma.permission.createMany({
                    data: [
                        {
                            roleId: subRole.id,
                            moduleId: mainModule.id,
                            permission: "MANAGE",
                        },
                        {
                            roleId: subRole.id,
                            moduleId: subMod.id,
                            permission: "MANAGE",
                        },
                    ],
                });
            }
        }
    }

    // --- Create Users ---
    const createdUsers: any[] = [];
    const users = [
        { email: "super.admin@example.com", firstName: "Super", lastName: "Admin" },
        { email: "john.doe@example.com", firstName: "John", lastName: "Doe" },
        { email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith" },
        { email: "robert.jones@example.com", firstName: "Robert", lastName: "Jones" },
        { email: "alice.brown@example.com", firstName: "Alice", lastName: "Brown" },
        { email: "michael.davis@example.com", firstName: "Michael", lastName: "Davis" },
        { email: "linda.wilson@example.com", firstName: "Linda", lastName: "Wilson" },
        { email: "david.garcia@example.com", firstName: "David", lastName: "Garcia" },
        { email: "maria.rodriguez@example.com", firstName: "Maria", lastName: "Rodriguez" },
        {
            email: "christopher.williams@example.com",
            firstName: "Christopher",
            lastName: "Williams",
        },
        { email: "jennifer.martinez@example.com", firstName: "Jennifer", lastName: "Martinez" },
        { email: "james.anderson@example.com", firstName: "James", lastName: "Anderson" },
        { email: "laura.thomas@example.com", firstName: "Laura", lastName: "Thomas" },
        { email: "kevin.jackson@example.com", firstName: "Kevin", lastName: "Jackson" },
        { email: "jessica.white@example.com", firstName: "Jessica", lastName: "White" },
    ];

    for (const userData of users) {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        const user = await prisma.user.create({
            data: { ...userData, companyId: randomCompany.id },
        });
        createdUsers.push(user);
    }

    // --- Seed Assets: Portfolios, Regulation Groups, and Regulation Units ---
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

    // Update AssetRecord type to include companyId
    type AssetRecord = {
        id: number;
        assetType: "Portfolio" | "RegulationGroup" | "RegulationUnit";
        ownerId: number;
        companyId: number;
    };
    const createdAssets: AssetRecord[] = [];

    for (const pData of portfoliosData) {
        // Filter companies that have at least one user.
        const availableCompanies = companies.filter((company) =>
            createdUsers.some((u) => u.companyId === company.id)
        );
        const randomCompany =
            availableCompanies[Math.floor(Math.random() * availableCompanies.length)];
        // Choose portfolio owner with fallback.
        const potentialPortfolioOwners = createdUsers.filter(
            (u) => u.companyId === randomCompany.id
        );
        const portfolioOwner =
            potentialPortfolioOwners.length > 0
                ? potentialPortfolioOwners[
                      Math.floor(Math.random() * potentialPortfolioOwners.length)
                  ]
                : createdUsers[0];
        const portfolio = await prisma.portfolio.create({
            data: { name: pData.name, companyId: randomCompany.id, ownerId: portfolioOwner.id },
        });
        createdAssets.push({
            id: portfolio.id,
            assetType: "Portfolio",
            ownerId: portfolioOwner.id,
            companyId: randomCompany.id,
        });
        for (const groupData of pData.groups) {
            // Choose group owner with fallback.
            const potentialGroupOwners = createdUsers.filter(
                (u) => u.companyId === randomCompany.id
            );
            const groupOwner =
                potentialGroupOwners.length > 0
                    ? potentialGroupOwners[Math.floor(Math.random() * potentialGroupOwners.length)]
                    : createdUsers[0];
            const regGroup = await prisma.regulationGroup.create({
                data: {
                    name: groupData.name,
                    portfolioId: portfolio.id,
                    ownerId: groupOwner.id,
                },
            });
            createdAssets.push({
                id: regGroup.id,
                assetType: "RegulationGroup",
                ownerId: groupOwner.id,
                companyId: randomCompany.id,
            });
            // Ensure the portfolio owner gets access if not the group owner.
            if (groupOwner.id !== portfolioOwner.id) {
                await safeCreateUserAsset({
                    userId: portfolioOwner.id,
                    assetId: regGroup.id,
                    assetType: "RegulationGroup",
                });
            }
            for (const unitName of groupData.units) {
                // Choose unit owner with fallback.
                const potentialUnitOwners = createdUsers.filter(
                    (u) => u.companyId === randomCompany.id
                );
                const unitOwner =
                    potentialUnitOwners.length > 0
                        ? potentialUnitOwners[
                              Math.floor(Math.random() * potentialUnitOwners.length)
                          ]
                        : createdUsers[0];
                const regUnit = await prisma.regulationUnit.create({
                    data: { name: unitName, groupId: regGroup.id, ownerId: unitOwner.id },
                });
                createdAssets.push({
                    id: regUnit.id,
                    assetType: "RegulationUnit",
                    ownerId: unitOwner.id,
                    companyId: randomCompany.id,
                });
                // Ensure the group owner and portfolio owner get access if different.
                if (unitOwner.id !== groupOwner.id) {
                    await safeCreateUserAsset({
                        userId: groupOwner.id,
                        assetId: regUnit.id,
                        assetType: "RegulationUnit",
                    });
                }
                if (unitOwner.id !== portfolioOwner.id) {
                    await safeCreateUserAsset({
                        userId: portfolioOwner.id,
                        assetId: regUnit.id,
                        assetType: "RegulationUnit",
                    });
                }
            }
        }
    }

    // --- Assign Scopes to Assets via RoleAsset join ---
    if (createdRoles.length === 0) {
        console.error("No roles were created. Check modulesData and role creation logic.");
    } else {
        for (const asset of createdAssets) {
            const randomRole = createdRoles[Math.floor(Math.random() * createdRoles.length)];
            // Already creating RoleAsset, but also create a matching UserAssetRole
            // for the asset's owner, so it appears in their roles list.
            await prisma.roleAsset.create({
                data: {
                    roleId: randomRole.id,
                    assetId: asset.id,
                    assetType: asset.assetType,
                },
            });
            // Add user-specific role assignment for the asset’s owner:
            await prisma.userAssetRole.create({
                data: {
                    userId: asset.ownerId,
                    roleId: randomRole.id,
                    assetId: asset.id,
                    assetType: asset.assetType,
                },
            });
        }
    }

    // --- Assign Assets to Users via UserAsset join ---
    // Only assign assets from the matching company.
    const userAssetAssignments: Array<{ userId: number; assetId: number; assetType: string }> = [];
    for (const user of createdUsers) {
        // Filter assets by user's company
        const companyAssets = createdAssets.filter((asset) => asset.companyId === user.companyId);
        const assignedAssets = new Set<string>();
        const numberOfAssetsToAssign = Math.floor(Math.random() * companyAssets.length) + 1;
        for (let i = 0; i < numberOfAssetsToAssign; i++) {
            const randomAssetIndex = Math.floor(Math.random() * companyAssets.length);
            const asset = companyAssets[randomAssetIndex];
            const assetIdentifier = `${asset.id}-${asset.assetType}`;
            if (!assignedAssets.has(assetIdentifier)) {
                userAssetAssignments.push({
                    userId: user.id,
                    assetId: asset.id,
                    assetType: asset.assetType,
                });
                assignedAssets.add(assetIdentifier);
            }
        }
    }
    if (userAssetAssignments.length > 0) {
        await prisma.userAsset.createMany({
            data: userAssetAssignments,
            skipDuplicates: true,
        });
    }

    // --- Set Active User to the First User ---
    const superAdminUser = createdUsers[0];
    if (superAdminUser) {
        await prisma.activeUser.upsert({
            where: { id: 1 },
            update: { userId: superAdminUser.id },
            create: { id: 1, userId: superAdminUser.id },
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
