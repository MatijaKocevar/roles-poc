"use server";

import prisma from "@/lib/prisma";

export interface FlatAsset {
    assetType: string;
    id: number | null;
    name: string | null;
    accessProfiles: {
        id: number;
        name: string;
        permissions: {
            id: number;
            moduleId: number;
            accessProfileId: number;
            permission: "VIEW" | "MANAGE";
            module: {
                id: number;
                name: string;
                parentId: number | null;
                slug: string;
            };
        }[];
    }[];
}

export async function getUserById(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            userAssets: true,
            company: true,
        },
    });

    if (!user) return null;

    const portfolioIds: number[] = [];
    const regGroupIds: number[] = [];
    const regUnitIds: number[] = [];

    user.userAssets.forEach((ua) => {
        if (ua.assetType === "Portfolio") portfolioIds.push(ua.assetId);
        if (ua.assetType === "RegulationGroup") regGroupIds.push(ua.assetId);
        if (ua.assetType === "RegulationUnit") regUnitIds.push(ua.assetId);
    });

    const [portfolios, groups, units] = await Promise.all([
        prisma.portfolio.findMany({
            where: { id: { in: portfolioIds } },
            select: { id: true, name: true },
        }),
        prisma.regulationGroup.findMany({
            where: { id: { in: regGroupIds } },
            select: { id: true, name: true },
        }),
        prisma.regulationUnit.findMany({
            where: { id: { in: regUnitIds } },
            select: { id: true, name: true },
        }),
    ]);

    const userAssetRoles = await prisma.userAccessProfile.findMany({
        where: {
            userId,
            OR: [
                { assetType: "Portfolio", assetId: { in: portfolioIds } },
                { assetType: "RegulationGroup", assetId: { in: regGroupIds } },
                { assetType: "RegulationUnit", assetId: { in: regUnitIds } },
            ],
        },
        select: {
            assetId: true,
            assetType: true,
            accessProfile: {
                select: {
                    id: true,
                    name: true,
                    permissions: {
                        select: {
                            id: true,
                            permission: true,
                            moduleId: true,
                            module: {
                                select: {
                                    id: true,
                                    name: true,
                                    parentId: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const portfolioMap = Object.fromEntries(portfolios.map((p) => [p.id, p]));
    const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u]));

    const userRolesMap = new Map<string, any[]>();
    for (const r of userAssetRoles) {
        const key = `${r.assetType}:${r.assetId}`;
        if (!userRolesMap.has(key)) userRolesMap.set(key, []);
        userRolesMap.get(key)?.push(r.accessProfile);
    }

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails;
        if (ua.assetType === "Portfolio") assetDetails = portfolioMap[ua.assetId];
        if (ua.assetType === "RegulationGroup") assetDetails = groupMap[ua.assetId];
        if (ua.assetType === "RegulationUnit") assetDetails = unitMap[ua.assetId];

        const accessProfiles = userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || [];
        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            accessProfiles,
        };
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            company: user.company,
            assets: flatAssets as FlatAsset[],
        },
    };
}

export async function getActiveUser() {
    const active = await prisma.activeUser.findUnique({ where: { id: 1 } });
    if (!active) return null;

    const user = await prisma.user.findUnique({
        where: { id: active.userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            userAssets: true,
            company: true,
        },
    });
    if (!user) return null;

    const portfolioIds: number[] = [];
    const regGroupIds: number[] = [];
    const regUnitIds: number[] = [];

    user.userAssets.forEach((ua) => {
        if (ua.assetType === "Portfolio") portfolioIds.push(ua.assetId);
        if (ua.assetType === "RegulationGroup") regGroupIds.push(ua.assetId);
        if (ua.assetType === "RegulationUnit") regUnitIds.push(ua.assetId);
    });

    const [portfolios, groups, units] = await Promise.all([
        prisma.portfolio.findMany({
            where: { id: { in: portfolioIds } },
            select: { id: true, name: true },
        }),
        prisma.regulationGroup.findMany({
            where: { id: { in: regGroupIds } },
            select: { id: true, name: true },
        }),
        prisma.regulationUnit.findMany({
            where: { id: { in: regUnitIds } },
            select: { id: true, name: true },
        }),
    ]);

    const userAssetRoles = await prisma.userAccessProfile.findMany({
        where: {
            userId: user.id,
            OR: [
                { assetType: "Portfolio", assetId: { in: portfolioIds } },
                { assetType: "RegulationGroup", assetId: { in: regGroupIds } },
                { assetType: "RegulationUnit", assetId: { in: regUnitIds } },
            ],
        },
        select: {
            assetId: true,
            assetType: true,
            accessProfile: {
                select: {
                    id: true,
                    name: true,
                    permissions: {
                        select: {
                            id: true,
                            permission: true,
                            moduleId: true,
                            module: {
                                select: {
                                    id: true,
                                    name: true,
                                    parentId: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const portfolioMap = Object.fromEntries(portfolios.map((p) => [p.id, p]));
    const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u]));

    const userRolesMap = new Map<string, any[]>();
    for (const r of userAssetRoles) {
        const key = `${r.assetType}:${r.assetId}`;
        if (!userRolesMap.has(key)) userRolesMap.set(key, []);
        userRolesMap.get(key)?.push(r.accessProfile);
    }

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails;
        if (ua.assetType === "Portfolio") assetDetails = portfolioMap[ua.assetId];
        if (ua.assetType === "RegulationGroup") assetDetails = groupMap[ua.assetId];
        if (ua.assetType === "RegulationUnit") assetDetails = unitMap[ua.assetId];

        const accessProfiles = userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || [];
        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            accessProfiles,
        };
    });

    return {
        activeUser: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            company: user.company,
            assets: flatAssets as FlatAsset[],
        },
    };
}

export async function getUsersList(activeUserId: number) {
    const activeUser = await prisma.user.findUnique({
        where: { id: activeUserId },
        select: { id: true, role: true, companyId: true },
    });
    if (!activeUser) return [];

    let whereClause = {};
    if (activeUser.role === "SUPER_ADMIN") {
        whereClause = {};
    } else if (activeUser.role === "COMPANY_MANAGER") {
        whereClause = {
            companyId: activeUser.companyId,
            role: { in: ["PORTFOLIO_MANAGER", "REG_GROUP_MANAGER", "UNIT_MANAGER"] },
        };
    } else if (activeUser.role === "PORTFOLIO_MANAGER") {
        const userPortfolios = await prisma.userAsset.findMany({
            where: {
                userId: activeUser.id,
                assetType: "Portfolio",
            },
            select: { assetId: true },
        });
        const portfolioIds = userPortfolios.map((p) => p.assetId);
        const groups = await prisma.regulationGroup.findMany({
            where: { portfolioId: { in: portfolioIds } },
            select: {
                id: true,
                units: { select: { id: true } },
            },
        });
        const groupIds = groups.map((g) => g.id);
        const unitIds = groups.flatMap((g) => g.units.map((u) => u.id));

        whereClause = {
            companyId: activeUser.companyId,
            role: { in: ["REG_GROUP_MANAGER", "UNIT_MANAGER"] },
            userAssets: {
                some: {
                    OR: [
                        { assetType: "RegulationGroup", assetId: { in: groupIds } },
                        { assetType: "RegulationUnit", assetId: { in: unitIds } },
                    ],
                },
            },
        };
    } else if (activeUser.role === "REG_GROUP_MANAGER") {
        const userGroups = await prisma.userAsset.findMany({
            where: {
                userId: activeUser.id,
                assetType: "RegulationGroup",
            },
            select: { assetId: true },
        });
        const groupIds = userGroups.map((g) => g.assetId);
        const units = await prisma.regulationUnit.findMany({
            where: { groupId: { in: groupIds } },
            select: { id: true },
        });
        const unitIds = units.map((u) => u.id);

        whereClause = {
            companyId: activeUser.companyId,
            role: "UNIT_MANAGER",
            userAssets: {
                some: {
                    assetType: "RegulationUnit",
                    assetId: { in: unitIds },
                },
            },
        };
    } else if (activeUser.role === "UNIT_MANAGER") {
        whereClause = { id: activeUser.id };
    }

    const users = await prisma.user.findMany({
        where: activeUser.role === "SUPER_ADMIN" ? {} : whereClause,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            company: { select: { id: true, name: true } },
        },
    });

    return activeUser.role === "UNIT_MANAGER" ? users : users.filter((u) => u.id !== activeUser.id);
}
