"use server";

import prisma from "@/lib/prisma";
import { FlatAsset } from "./active-user";

export async function getUserById(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userAssets: true,
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

    const [portfolios, groups, units, roleAssets] = await Promise.all([
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
        prisma.roleAsset.findMany({
            where: {
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
                            include: { module: true },
                        },
                    },
                },
            },
        }),
    ]);

    const portfolioMap = Object.fromEntries(portfolios.map((p) => [p.id, p]));
    const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u]));

    const roleAssetsMap = new Map();
    roleAssets.forEach((ra) => {
        const key = `${ra.assetType}:${ra.assetId}`;
        if (!roleAssetsMap.has(key)) roleAssetsMap.set(key, []);
        roleAssetsMap.get(key).push(ra.role);
    });

    const flatAssets = user.userAssets.map((ua) => {
        let assetDetails;
        if (ua.assetType === "Portfolio") assetDetails = portfolioMap[ua.assetId];
        if (ua.assetType === "RegulationGroup") assetDetails = groupMap[ua.assetId];
        if (ua.assetType === "RegulationUnit") assetDetails = unitMap[ua.assetId];

        const roles = roleAssetsMap.get(`${ua.assetType}:${ua.assetId}`) || [];
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
            assets: flatAssets as FlatAsset[],
        },
    };
}
