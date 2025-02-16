"use server";

import { getAllAssets } from "@/actions/asset";
import prisma from "@/lib/prisma";
import { AccessProfileWithSource, AssetAccess, FlatAsset, UserAccessData } from "@/types/user";
import { AssetType, PermissionType } from "@prisma/client";

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

    groups.forEach((group) => {
        if (group.portfolioId) {
            assetHierarchy.set(`${AssetType.REGULATION_GROUP}:${group.id}`, {
                parentType: AssetType.PORTFOLIO,
                parentId: group.portfolioId,
            });
        }
    });

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

        const directAccessProfiles = (userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || []).map(
            (p) => ({
                id: p.id,
                name: p.name,
                permissions: p.permissions,
                source: undefined,
            })
        );

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

    groups.forEach((group) => {
        if (group.portfolioId) {
            assetHierarchy.set(`${AssetType.REGULATION_GROUP}:${group.id}`, {
                parentType: AssetType.PORTFOLIO,
                parentId: group.portfolioId,
            });
        }
    });

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

        const directAccessProfiles = (userRolesMap.get(`${ua.assetType}:${ua.assetId}`) || []).map(
            (p) => ({
                id: p.id,
                name: p.name,
                permissions: p.permissions,
                source: undefined,
            })
        );

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

export async function getUserAccess(assets: FlatAsset[], role?: string): Promise<UserAccessData> {
    const modules = await prisma.module.findMany();
    const modulePermissions = new Map<number, PermissionType>();
    const assetAccessMap = new Map<string, AssetAccess>();

    assets.forEach((asset) => {
        const assetKey = `${asset.assetType}:${asset.id}`;

        if (!assetAccessMap.has(assetKey)) {
            assetAccessMap.set(assetKey, {
                assetType: asset.assetType,
                id: asset.id!,
                name: asset.name!,
                portfolioId: asset.portfolioId,
                groupId: asset.groupId,
                accessProfiles: [],
            });
        }

        const assetData = assetAccessMap.get(assetKey)!;

        asset.accessProfiles.forEach((profile) => {
            const modulePerms = profile.permissions.map((perm) => {
                const currentPermission = modulePermissions.get(perm.module.id);
                if (
                    !currentPermission ||
                    perm.permission === "MANAGE" ||
                    (perm.permission === "CUSTOM" && currentPermission === "VIEW")
                ) {
                    modulePermissions.set(perm.module.id, perm.permission);
                }

                return {
                    moduleId: perm.module.id,
                    permission: perm.permission,
                };
            });

            assetData.accessProfiles.push({
                id: profile.id,
                name: profile.name,
                modulePermissions: modulePerms,
                source: profile.source,
            });
        });
    });

    return {
        moduleAccess: modules.map((module) => ({
            id: module.id,
            name: module.name,
            slug: module.slug,
            parentId: module.parentId,
            hasAccess: role === "SUPER_ADMIN" ? true : modulePermissions.has(module.id),
            permission:
                role === "SUPER_ADMIN" ? "MANAGE" : modulePermissions.get(module.id) || "VIEW",
        })),
        assetAccess: Array.from(assetAccessMap.values()),
    };
}

export async function getUserModuleAssets(moduleSlug: string) {
    const userData = await getActiveUser();
    if (!userData?.activeUser) return null;

    const accessData = await getUserAccess(userData.activeUser.assets, userData.activeUser.role);

    if (userData.activeUser.role === "SUPER_ADMIN") {
        return await getAllAssets();
    }

    const mod = accessData.moduleAccess.find((m) => m.slug === moduleSlug);
    if (!mod?.hasAccess) return null;

    return accessData.assetAccess.filter((asset) =>
        asset.accessProfiles.some((profile) =>
            profile.modulePermissions.some((perm) => perm.moduleId === mod.id)
        )
    );
}
