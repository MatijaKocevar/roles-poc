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
    await prisma.accessProfileAsset.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.activeUser.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.accessProfile.deleteMany({});
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
        { name: "Management", submodules: ["Users", "Access Profiles", "Companies"] },
        { name: "Contracts", submodules: ["Overview", "History"] },
        { name: "Reports", submodules: ["Settlements", "Logs"] },
    ];

    const mainModulesMap = new Map<string, any>();
    for (const moduleData of modulesData) {
        const mainModule = await prisma.module.create({
            data: { name: moduleData.name, slug: generateSlug(moduleData.name) },
        });
        mainModulesMap.set(moduleData.name, mainModule);
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

    // --- Seed Roles & Permissions based on custom logic ---
    // Create AccessProfiles: Admin, Manager, User
    const adminProfile = await prisma.accessProfile.create({ data: { name: "Admin" } });
    const managerProfile = await prisma.accessProfile.create({ data: { name: "Manager" } });
    const userProfile = await prisma.accessProfile.create({ data: { name: "User" } });

    // Define which main modules Manager and User can manage
    const managerManageList = ["Trading", "Models", "Management", "Reports"];
    const userManageList = ["Trading"];

    for (const mod of allModules) {
        // Determine effective name: use parent's name for submodules if available
        let effectiveName = mod.name;
        if (mod.parentId) {
            const parentModule = allModules.find((m) => m.id === mod.parentId);
            if (parentModule) {
                effectiveName = parentModule.name;
            }
        }
        // Admin: MANAGE on all modules
        await prisma.permission.create({
            data: {
                accessProfileId: adminProfile.id,
                moduleId: mod.id,
                permission: "MANAGE",
            },
        });
        // Manager: MANAGE if effectiveName is in managerManageList, else VIEW
        await prisma.permission.create({
            data: {
                accessProfileId: managerProfile.id,
                moduleId: mod.id,
                permission: managerManageList.includes(effectiveName) ? "MANAGE" : "VIEW",
            },
        });
        // User: MANAGE if effectiveName is in userManageList, else VIEW
        await prisma.permission.create({
            data: {
                accessProfileId: userProfile.id,
                moduleId: mod.id,
                permission: userManageList.includes(effectiveName) ? "MANAGE" : "VIEW",
            },
        });
    }

    // --- Create Global Super Admin (only one) ---
    const superAdmin = await prisma.user.create({
        data: {
            email: "superadmin@example.com",
            firstName: "Super",
            lastName: "Admin",
            role: "SUPER_ADMIN", // Ensure role is set
        },
    });

    // --- Create Users per Company (excluding super admin) ---
    // Replace the single user set per company with TWO user sets.
    const companyUserSets: {
        companyManager: any;
        portfolioManager: any;
        regGroupManager: any;
        unitManager: any;
    }[][] = [];
    for (const company of companies) {
        const companyManager = await prisma.user.create({
            data: {
                email: `${company.name.toLowerCase().replace(/\s+/g, "")}_manager@example.com`,
                firstName: "Company",
                lastName: "Manager",
                companyId: company.id,
                role: "COMPANY_MANAGER",
            },
        });
        const userSets: {
            companyManager: any;
            portfolioManager: any;
            regGroupManager: any;
            unitManager: any;
        }[] = [];
        for (let set = 1; set <= 2; set++) {
            const portfolioManager = await prisma.user.create({
                data: {
                    email: `${company.name
                        .toLowerCase()
                        .replace(/\s+/g, "")}_portfolio_set${set}@example.com`,
                    firstName: "Portfolio",
                    lastName: `Manager${set}`,
                    companyId: company.id,
                    role: "PORTFOLIO_MANAGER",
                },
            });
            const regGroupManager = await prisma.user.create({
                data: {
                    email: `${company.name
                        .toLowerCase()
                        .replace(/\s+/g, "")}_reggroup_set${set}@example.com`,
                    firstName: "Regulation",
                    lastName: `Group Manager${set}`,
                    companyId: company.id,
                    role: "REG_GROUP_MANAGER",
                },
            });
            const unitManager = await prisma.user.create({
                data: {
                    email: `${company.name
                        .toLowerCase()
                        .replace(/\s+/g, "")}_unit_set${set}@example.com`,
                    firstName: "Unit",
                    lastName: `Manager${set}`,
                    companyId: company.id,
                    role: "UNIT_MANAGER",
                },
            });
            userSets.push({
                companyManager: companyManager,
                portfolioManager,
                regGroupManager,
                unitManager,
            });
        }
        companyUserSets.push(userSets);
    }

    // --- Seed Assets for each Company ---
    // For each company, iterate over its two user sets and create one portfolio, one group, and one unit per set.
    for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const userSets = companyUserSets[i];
        const companyManager = userSets[0].companyManager; // Get the company manager

        for (const [setIndex, users] of userSets.entries()) {
            const portfolio = await prisma.portfolio.create({
                data: {
                    name: `Portfolio ${setIndex + 1} - ${company.name}`,
                    companyId: company.id,
                    //ownerId: users.portfolioManager.id, // Removed ownerId
                },
            });
            const regGroup = await prisma.regulationGroup.create({
                data: {
                    name: `Group ${setIndex + 1} - ${company.name}`,
                    portfolioId: portfolio.id,
                    //ownerId: users.regGroupManager.id, // Removed ownerId
                },
            });
            const regUnit = await prisma.regulationUnit.create({
                data: {
                    name: `Unit ${setIndex + 1} - ${company.name}`,
                    groupId: regGroup.id,
                    ownerId: users.unitManager.id,
                },
            });

            // Assign assets to the respective users
            // Company manager: portfolio, group, unit
            await prisma.userAsset.create({
                data: { userId: companyManager.id, assetId: portfolio.id, assetType: "Portfolio" },
            });
            await prisma.userAsset.create({
                data: {
                    userId: companyManager.id,
                    assetId: regGroup.id,
                    assetType: "RegulationGroup",
                },
            });
            await prisma.userAsset.create({
                data: {
                    userId: companyManager.id,
                    assetId: regUnit.id,
                    assetType: "RegulationUnit",
                },
            });

            // Portfolio manager: portfolio, group, unit
            await prisma.userAsset.create({
                data: {
                    userId: users.portfolioManager.id,
                    assetId: portfolio.id,
                    assetType: "Portfolio",
                },
            });
            await prisma.userAsset.create({
                data: {
                    userId: users.portfolioManager.id,
                    assetId: regGroup.id,
                    assetType: "RegulationGroup",
                },
            });
            await prisma.userAsset.create({
                data: {
                    userId: users.portfolioManager.id,
                    assetId: regUnit.id,
                    assetType: "RegulationUnit",
                },
            });

            // Group manager: group, unit
            await prisma.userAsset.create({
                data: {
                    userId: users.regGroupManager.id,
                    assetId: regGroup.id,
                    assetType: "RegulationGroup",
                },
            });
            await prisma.userAsset.create({
                data: {
                    userId: users.regGroupManager.id,
                    assetId: regUnit.id,
                    assetType: "RegulationUnit",
                },
            });

            // Unit manager: unit only
            await prisma.userAsset.create({
                data: {
                    userId: users.unitManager.id,
                    assetId: regUnit.id,
                    assetType: "RegulationUnit",
                },
            });
        }
    }

    // --- Set Active User to the Global Super Admin ---
    await prisma.activeUser.upsert({
        where: { id: 1 },
        update: { userId: superAdmin.id },
        create: { id: 1, userId: superAdmin.id },
    });
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
