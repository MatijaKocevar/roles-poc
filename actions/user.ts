"use server";

import prisma from "@/lib/prisma";

export interface FlatAsset {
    assetType: string;
    id: number | null;
    name: string | null;
    roles: {
        id: number;
        name: string;
        permissions: {
            id: number;
            moduleId: number;
            roleId: number;
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

    const userAssetRoles = await prisma.userAssetRole.findMany({
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
            role: {
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
        userRolesMap.get(key)?.push(r.role);
    }

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails;
        if (ua.assetType === "Portfolio") assetDetails = portfolioMap[ua.assetId];
        if (ua.assetType === "RegulationGroup") assetDetails = groupMap[ua.assetId];
        if (ua.assetType === "RegulationUnit") assetDetails = unitMap[ua.assetId];

        const roles = userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || [];
        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            roles,
        };
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company, // include company data
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

    const userAssetRoles = await prisma.userAssetRole.findMany({
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
            role: {
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
        userRolesMap.get(key)?.push(r.role);
    }

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails;
        if (ua.assetType === "Portfolio") assetDetails = portfolioMap[ua.assetId];
        if (ua.assetType === "RegulationGroup") assetDetails = groupMap[ua.assetId];
        if (ua.assetType === "RegulationUnit") assetDetails = unitMap[ua.assetId];

        const roles = userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || [];
        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            roles,
        };
    });

    return {
        activeUser: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company, // include company data
            assets: flatAssets as FlatAsset[],
        },
    };
}
