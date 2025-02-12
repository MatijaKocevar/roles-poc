"use server";

import prisma from "@/lib/prisma";
import { AssetType, PermissionType } from "@prisma/client";

export interface AccessProfileWithSource {
    id: number;
    name: string;
    source?: {
        type: AssetType;
        id: number;
        name: string;
    };
    permissions: {
        id: number;
        permission: PermissionType;
        module: {
            id: number;
            name: string;
            parentId: number | null;
            slug: string;
        };
    }[];
}

export interface FlatAsset {
    assetType: AssetType;
    id: number | null;
    name: string | null;
    portfolioId?: number;
    groupId?: number;
    accessProfiles: AccessProfileWithSource[];
}

interface GroupDetails {
    id: number;
    name: string;
    portfolioId: number;
}

interface UnitDetails {
    id: number;
    name: string;
    groupId: number;
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
        if (ua.assetType === AssetType.PORTFOLIO) portfolioIds.push(ua.assetId);
        if (ua.assetType === AssetType.REGULATION_GROUP) regGroupIds.push(ua.assetId);
        if (ua.assetType === AssetType.REGULATION_UNIT) regUnitIds.push(ua.assetId);
    });

    const [portfolios, groups, units] = await Promise.all([
        prisma.portfolio.findMany({
            where: { id: { in: portfolioIds } },
            select: {
                id: true,
                name: true,
            },
        }),
        prisma.regulationGroup.findMany({
            where: { id: { in: regGroupIds } },
            select: {
                id: true,
                name: true,
                portfolioId: true,
            },
        }),
        prisma.regulationUnit.findMany({
            where: { id: { in: regUnitIds } },
            select: {
                id: true,
                name: true,
                groupId: true,
            },
        }),
    ]);

    const userAssetRoles = await prisma.userAccessProfile.findMany({
        where: {
            userId,
            OR: [
                { assetType: AssetType.PORTFOLIO, assetId: { in: portfolioIds } },
                { assetType: AssetType.REGULATION_GROUP, assetId: { in: regGroupIds } },
                { assetType: AssetType.REGULATION_UNIT, assetId: { in: regUnitIds } },
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

    const assetHierarchy = new Map<string, { parentType: AssetType; parentId: number }>();

    // Map groups to portfolios
    groups.forEach((group) => {
        if (group.portfolioId) {
            assetHierarchy.set(`${AssetType.REGULATION_GROUP}:${group.id}`, {
                parentType: AssetType.PORTFOLIO,
                parentId: group.portfolioId,
            });
        }
    });

    // Map units to groups
    units.forEach((unit) => {
        if (unit.groupId) {
            assetHierarchy.set(`${AssetType.REGULATION_UNIT}:${unit.id}`, {
                parentType: AssetType.REGULATION_GROUP,
                parentId: unit.groupId,
            });
        }
    });

    const getInheritedAccessProfiles = (
        assetType: AssetType,
        assetId: number
    ): AccessProfileWithSource[] => {
        const key = `${assetType}:${assetId}`;
        const parent = assetHierarchy.get(key);

        if (!parent) return [];

        // Get direct parent's profiles
        const parentProfiles = userAssetRoles
            .filter((r) => r.assetType === parent.parentType && r.assetId === parent.parentId)
            .map((r) => ({
                id: r.accessProfile.id,
                name: r.accessProfile.name,
                permissions: r.accessProfile.permissions.map(
                    (perm: {
                        id: number;
                        permission: PermissionType;
                        module: {
                            id: number;
                            name: string;
                            parentId: number | null;
                            slug: string;
                        };
                    }) => ({
                        id: perm.id,
                        permission: perm.permission,
                        module: perm.module,
                    })
                ),
                source: {
                    type: parent.parentType,
                    id: parent.parentId,
                    name:
                        parent.parentType === AssetType.PORTFOLIO
                            ? portfolioMap[parent.parentId]?.name
                            : groupMap[parent.parentId]?.name,
                },
            }));

        // Recursively get grandparent's profiles
        const grandparentProfiles = getInheritedAccessProfiles(parent.parentType, parent.parentId);

        return [...parentProfiles, ...grandparentProfiles];
    };

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails:
            | { id: number; name: string; portfolioId?: number; groupId?: number }
            | undefined;

        if (ua.assetType === AssetType.PORTFOLIO) {
            assetDetails = portfolioMap[ua.assetId];
        } else if (ua.assetType === AssetType.REGULATION_GROUP) {
            assetDetails = groupMap[ua.assetId];
        } else if (ua.assetType === AssetType.REGULATION_UNIT) {
            assetDetails = unitMap[ua.assetId];
        }

        // Get direct access profiles
        const directAccessProfiles = (userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || []).map(
            (p) => ({
                id: p.id,
                name: p.name,
                permissions: p.permissions,
                source: undefined,
            })
        );

        // Get inherited access profiles
        const inheritedAccessProfiles = getInheritedAccessProfiles(ua.assetType, ua.assetId);

        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            portfolioId: assetDetails?.portfolioId,
            groupId: assetDetails?.groupId,
            accessProfiles: [...directAccessProfiles, ...inheritedAccessProfiles],
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
        if (ua.assetType === AssetType.PORTFOLIO) portfolioIds.push(ua.assetId);
        if (ua.assetType === AssetType.REGULATION_GROUP) regGroupIds.push(ua.assetId);
        if (ua.assetType === AssetType.REGULATION_UNIT) regUnitIds.push(ua.assetId);
    });

    const [portfolios, groups, units] = await Promise.all([
        prisma.portfolio.findMany({
            where: { id: { in: portfolioIds } },
            select: {
                id: true,
                name: true,
            },
        }),
        prisma.regulationGroup.findMany({
            where: { id: { in: regGroupIds } },
            select: {
                id: true,
                name: true,
                portfolioId: true,
            },
        }),
        prisma.regulationUnit.findMany({
            where: { id: { in: regUnitIds } },
            select: {
                id: true,
                name: true,
                groupId: true,
            },
        }),
    ]);

    const userAssetRoles = await prisma.userAccessProfile.findMany({
        where: {
            userId: user.id,
            OR: [
                { assetType: AssetType.PORTFOLIO, assetId: { in: portfolioIds } },
                { assetType: AssetType.REGULATION_GROUP, assetId: { in: regGroupIds } },
                { assetType: AssetType.REGULATION_UNIT, assetId: { in: regUnitIds } },
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

    const assetHierarchy = new Map<string, { parentType: AssetType; parentId: number }>();

    // Map groups to portfolios
    groups.forEach((group) => {
        if (group.portfolioId) {
            assetHierarchy.set(`${AssetType.REGULATION_GROUP}:${group.id}`, {
                parentType: AssetType.PORTFOLIO,
                parentId: group.portfolioId,
            });
        }
    });

    // Map units to groups
    units.forEach((unit) => {
        if (unit.groupId) {
            assetHierarchy.set(`${AssetType.REGULATION_UNIT}:${unit.id}`, {
                parentType: AssetType.REGULATION_GROUP,
                parentId: unit.groupId,
            });
        }
    });

    const getInheritedAccessProfiles = (
        assetType: AssetType,
        assetId: number
    ): AccessProfileWithSource[] => {
        const key = `${assetType}:${assetId}`;
        const parent = assetHierarchy.get(key);

        if (!parent) return [];

        // Get direct parent's profiles
        const parentProfiles = userAssetRoles
            .filter((r) => r.assetType === parent.parentType && r.assetId === parent.parentId)
            .map((r) => ({
                id: r.accessProfile.id,
                name: r.accessProfile.name,
                permissions: r.accessProfile.permissions.map(
                    (perm: {
                        id: number;
                        permission: PermissionType;
                        module: {
                            id: number;
                            name: string;
                            parentId: number | null;
                            slug: string;
                        };
                    }) => ({
                        id: perm.id,
                        permission: perm.permission,
                        module: perm.module,
                    })
                ),
                source: {
                    type: parent.parentType,
                    id: parent.parentId,
                    name:
                        parent.parentType === AssetType.PORTFOLIO
                            ? portfolioMap[parent.parentId]?.name
                            : groupMap[parent.parentId]?.name,
                },
            }));

        // Recursively get grandparent's profiles
        const grandparentProfiles = getInheritedAccessProfiles(parent.parentType, parent.parentId);

        return [...parentProfiles, ...grandparentProfiles];
    };

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails:
            | { id: number; name: string; portfolioId?: number; groupId?: number }
            | undefined;

        if (ua.assetType === AssetType.PORTFOLIO) {
            assetDetails = portfolioMap[ua.assetId];
        } else if (ua.assetType === AssetType.REGULATION_GROUP) {
            assetDetails = groupMap[ua.assetId];
        } else if (ua.assetType === AssetType.REGULATION_UNIT) {
            assetDetails = unitMap[ua.assetId];
        }

        // Get direct access profiles
        const directAccessProfiles = (userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || []).map(
            (p) => ({
                id: p.id,
                name: p.name,
                permissions: p.permissions,
                source: undefined,
            })
        );

        // Get inherited access profiles
        const inheritedAccessProfiles = getInheritedAccessProfiles(ua.assetType, ua.assetId);

        return {
            assetType: ua.assetType,
            id: assetDetails?.id,
            name: assetDetails?.name,
            portfolioId: assetDetails?.portfolioId,
            groupId: assetDetails?.groupId,
            accessProfiles: [...directAccessProfiles, ...inheritedAccessProfiles],
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
                assetType: AssetType.PORTFOLIO,
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
                        { assetType: AssetType.REGULATION_GROUP, assetId: { in: groupIds } },
                        { assetType: AssetType.REGULATION_UNIT, assetId: { in: unitIds } },
                    ],
                },
            },
        };
    } else if (activeUser.role === "REG_GROUP_MANAGER") {
        const userGroups = await prisma.userAsset.findMany({
            where: {
                userId: activeUser.id,
                assetType: AssetType.REGULATION_GROUP,
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
                    assetType: AssetType.REGULATION_UNIT,
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
