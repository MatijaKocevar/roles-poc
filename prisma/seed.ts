import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main(): Promise<void> {
    await clearData();

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

    // --- Seed Global Roles & Global Permissions ---
    const allowedModules: { [role: string]: string[] } = {
        Basic_User: ["Trading", "Contracts"],
        // Other roles have access to all modules; no entry needed.
    };

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
        // Create global permissions for allowed modules only.
        for (const moduleObj of allModules) {
            if (
                allowedModules[roleData.name] &&
                !allowedModules[roleData.name].includes(moduleObj.name)
            ) {
                continue; // Skip modules not allowed for this role
            }
            await prisma.permission.create({
                data: {
                    roleId: role.id,
                    moduleId: moduleObj.id,
                    canView: roleData.permissions.canView,
                    canEdit: roleData.permissions.canEdit,
                    canDelete: roleData.permissions.canDelete,
                    canCreate: roleData.permissions.canCreate,
                },
            });
        }
    }

    // --- Create Users ---
    // Capture created users for later asset assignment.
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
        const user = await prisma.user.create({
            data: userData,
        });
        createdUsers.push(user);
    }

    // --- Seed Assets: Portfolios, Regulation Groups, and Regulation Units ---
    // Data for asset seeding.
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

    // Track created assets for role and user assignment.
    type AssetRecord = {
        id: number;
        assetType: "Portfolio" | "RegulationGroup" | "RegulationUnit";
    };
    const createdAssets: AssetRecord[] = [];

    for (const pData of portfoliosData) {
        const portfolio = await prisma.portfolio.create({ data: { name: pData.name } });
        createdAssets.push({ id: portfolio.id, assetType: "Portfolio" });
        for (const groupData of pData.groups) {
            const regGroup = await prisma.regulationGroup.create({
                data: { name: groupData.name, portfolioId: portfolio.id },
            });
            createdAssets.push({ id: regGroup.id, assetType: "RegulationGroup" });
            for (const unitName of groupData.units) {
                const regUnit = await prisma.regulationUnit.create({
                    data: { name: unitName, groupId: regGroup.id },
                });
                createdAssets.push({ id: regUnit.id, assetType: "RegulationUnit" });
            }
        }
    }

    // --- Assign Roles to Assets via RoleAsset join ---
    // For each asset, assign a random role.
    for (const asset of createdAssets) {
        const randomRole = createdRoles[Math.floor(Math.random() * createdRoles.length)];
        await prisma.roleAsset.create({
            data: {
                roleId: randomRole.id,
                assetId: asset.id,
                assetType: asset.assetType,
            },
        });
    }

    // --- Assign Assets to Users via UserAsset join ---
    for (const user of createdUsers) {
        // Keep track of assigned assets for the current user
        const assignedAssets = new Set<string>();

        // Assign a random number of assets to each user
        const numberOfAssetsToAssign = Math.floor(Math.random() * createdAssets.length) + 1; // Assign at least one asset

        for (let i = 0; i < numberOfAssetsToAssign; i++) {
            const randomAssetIndex = Math.floor(Math.random() * createdAssets.length);
            const asset = createdAssets[randomAssetIndex];
            const assetIdentifier = `${asset.id}-${asset.assetType}`;

            // Check if the asset has already been assigned to the user
            if (!assignedAssets.has(assetIdentifier)) {
                await prisma.userAsset.create({
                    data: {
                        userId: user.id,
                        assetId: asset.id,
                        assetType: asset.assetType,
                    },
                });

                // Add the asset to the set of assigned assets
                assignedAssets.add(assetIdentifier);
            }
        }
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
