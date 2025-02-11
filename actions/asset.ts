"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AssetType, UserRole } from "@prisma/client";
import { getActiveUser } from "./user";

interface AssetOption {
    id: number;
    name: string;
}

export async function addAssetToUser(userId: number, assetId: number, assetType: AssetType) {
    try {
        await prisma.userAsset.create({
            data: {
                userId: userId,
                assetId: assetId,
                assetType: assetType,
            },
        });

        if (assetType === AssetType.PORTFOLIO) {
            const groups = await prisma.regulationGroup.findMany({
                where: { portfolioId: assetId },
                include: { units: true },
            });

            await prisma.userAsset.createMany({
                data: groups.map((group) => ({
                    userId: userId,
                    assetId: group.id,
                    assetType: AssetType.REGULATION_GROUP,
                })),
                skipDuplicates: true,
            });

            const units = groups.flatMap((group) => group.units);

            await prisma.userAsset.createMany({
                data: units.map((unit) => ({
                    userId: userId,
                    assetId: unit.id,
                    assetType: AssetType.REGULATION_UNIT,
                })),
                skipDuplicates: true,
            });
        } else if (assetType === AssetType.REGULATION_GROUP) {
            const units = await prisma.regulationUnit.findMany({
                where: { groupId: assetId },
            });

            await prisma.userAsset.createMany({
                data: units.map((unit) => ({
                    userId: userId,
                    assetId: unit.id,
                    assetType: AssetType.REGULATION_UNIT,
                })),
                skipDuplicates: true,
            });
        }

        revalidatePath(`/`);

        return { success: true };
    } catch (error) {
        console.error("Error adding asset to user:", error);
        return { success: false, error: "Failed to add asset to user" };
    }
}

export async function removeAssetFromUser(userId: number, assetId: number, assetType: AssetType) {
    try {
        const assetIdsToRemove: { id: number; type: AssetType }[] = [];

        if (assetType === AssetType.PORTFOLIO) {
            const groups = await prisma.regulationGroup.findMany({
                where: { portfolioId: assetId },
                include: { units: true },
            });

            assetIdsToRemove.push(
                ...groups.map((group) => ({
                    id: group.id,
                    type: AssetType.REGULATION_GROUP,
                }))
            );

            const units = groups.flatMap((group) => group.units);

            assetIdsToRemove.push(
                ...units.map((unit) => ({
                    id: unit.id,
                    type: AssetType.REGULATION_UNIT,
                }))
            );
        } else if (assetType === AssetType.REGULATION_GROUP) {
            const units = await prisma.regulationUnit.findMany({
                where: { groupId: assetId },
            });

            assetIdsToRemove.push(
                ...units.map((unit) => ({
                    id: unit.id,
                    type: AssetType.REGULATION_UNIT,
                }))
            );
        }

        await prisma.$transaction(async (tx) => {
            for (const asset of assetIdsToRemove) {
                await tx.userAccessProfile.deleteMany({
                    where: {
                        userId: userId,
                        assetId: asset.id,
                        assetType: asset.type,
                    },
                });

                await tx.userAsset.deleteMany({
                    where: {
                        userId: userId,
                        assetId: asset.id,
                        assetType: asset.type,
                    },
                });
            }

            await tx.userAccessProfile.deleteMany({
                where: {
                    userId: userId,
                    assetId: assetId,
                    assetType: assetType,
                },
            });

            await tx.userAsset.deleteMany({
                where: {
                    userId: userId,
                    assetId: assetId,
                    assetType: assetType,
                },
            });
        });

        revalidatePath(`/`);

        return { success: true };
    } catch (error) {
        console.error("Error removing asset from user:", error);

        return { success: false, error: "Failed to remove asset from user" };
    }
}

export async function addRoleToAsset(
    userId: number,
    accessProfileId: number,
    assetId: number,
    assetType: AssetType
) {
    try {
        await prisma.userAccessProfile.create({
            data: {
                userId,
                accessProfileId,
                assetId,
                assetType,
            },
        });

        if (assetType === AssetType.PORTFOLIO) {
            const groups = await prisma.regulationGroup.findMany({
                where: { portfolioId: assetId },
                include: { units: true },
            });

            await prisma.userAccessProfile.createMany({
                data: groups.map((group) => ({
                    userId,
                    accessProfileId,
                    assetId: group.id,
                    assetType: AssetType.REGULATION_GROUP,
                })),
                skipDuplicates: true,
            });

            const units = groups.flatMap((group) => group.units);

            await prisma.userAccessProfile.createMany({
                data: units.map((unit) => ({
                    userId,
                    accessProfileId,
                    assetId: unit.id,
                    assetType: AssetType.REGULATION_UNIT,
                })),
                skipDuplicates: true,
            });
        } else if (assetType === AssetType.REGULATION_GROUP) {
            const units = await prisma.regulationUnit.findMany({
                where: { groupId: assetId },
            });

            await prisma.userAccessProfile.createMany({
                data: units.map((unit) => ({
                    userId,
                    accessProfileId,
                    assetId: unit.id,
                    assetType: AssetType.REGULATION_UNIT,
                })),
                skipDuplicates: true,
            });
        }

        revalidatePath(`/`);

        return { success: true };
    } catch (error) {
        console.error("Error adding role to asset:", error);

        return { success: false, error: "Failed to add role to asset" };
    }
}

export async function removeRoleFromAsset(
    userId: number,
    accessProfileId: number,
    assetId: number,
    assetType: AssetType
) {
    try {
        await prisma.userAccessProfile.deleteMany({
            where: { userId, accessProfileId, assetId, assetType },
        });

        revalidatePath(`/`);

        return { success: true };
    } catch (error) {
        console.error("Error removing role from asset:", error);

        return { success: false, error: "Failed to remove role from asset" };
    }
}

export async function getAllPortfolios() {
    try {
        const portfolios = await prisma.portfolio.findMany({
            select: { id: true, name: true },
        });

        return portfolios;
    } catch (error) {
        console.error("Error fetching portfolios:", error);

        return [];
    }
}

export async function getAllRegulationGroups() {
    try {
        const regulationGroups = await prisma.regulationGroup.findMany({
            select: { id: true, name: true },
        });

        return regulationGroups;
    } catch (error) {
        console.error("Error fetching regulation groups:", error);

        return [];
    }
}

export async function getAllRegulationUnits() {
    try {
        const regulationUnits = await prisma.regulationUnit.findMany({
            select: { id: true, name: true },
        });

        return regulationUnits;
    } catch (error) {
        console.error("Error fetching regulation units:", error);

        return [];
    }
}

export async function getAllRoles() {
    try {
        const accessProfiles = await prisma.accessProfile.findMany({
            select: { id: true, name: true },
        });

        return accessProfiles;
    } catch (error) {
        console.error("Error fetching accessProfiles:", error);

        return [];
    }
}

export async function getAssetTypeById(assetId: number): Promise<AssetType | null> {
    const [portfolio, group, unit] = await Promise.all([
        prisma.portfolio.findUnique({ where: { id: assetId } }),
        prisma.regulationGroup.findUnique({ where: { id: assetId } }),
        prisma.regulationUnit.findUnique({ where: { id: assetId } }),
    ]);

    if (unit) return AssetType.REGULATION_UNIT;
    if (group) return AssetType.REGULATION_GROUP;
    if (portfolio) return AssetType.PORTFOLIO;

    return null;
}

export async function getAvailableAssetsByCompany() {
    const activeResponse = await getActiveUser();

    if (!activeResponse?.activeUser) {
        return { portfolios: [], regulationGroups: [], regulationUnits: [] };
    }

    const activeUser = activeResponse.activeUser;
    const companyId = activeUser.company?.id;

    let portfolios: AssetOption[] = [];
    let regulationGroups: AssetOption[] = [];
    let regulationUnits: AssetOption[] = [];

    if (activeUser.role === UserRole.SUPER_ADMIN) {
        portfolios = await prisma.portfolio.findMany({ select: { id: true, name: true } });

        regulationGroups = await prisma.regulationGroup.findMany({
            select: { id: true, name: true },
        });

        regulationUnits = await prisma.regulationUnit.findMany({
            select: { id: true, name: true },
        });
    } else if (!companyId) {
        return { portfolios, regulationGroups, regulationUnits };
    } else if (activeUser.role === UserRole.COMPANY_MANAGER) {
        portfolios = await prisma.portfolio.findMany({
            where: { companyId },
            select: { id: true, name: true },
        });

        regulationGroups = await prisma.regulationGroup.findMany({
            where: { portfolio: { companyId } },
            select: { id: true, name: true },
        });

        regulationUnits = await prisma.regulationUnit.findMany({
            where: { group: { portfolio: { companyId } } },
            select: { id: true, name: true },
        });
    } else if (activeUser.role === UserRole.PORTFOLIO_MANAGER) {
        const myPortfolioIds = activeUser.assets
            .filter((a) => a.assetType === AssetType.PORTFOLIO && a.id != null)
            .map((a) => a.id as number);

        if (myPortfolioIds.length) {
            portfolios = [];

            regulationGroups = await prisma.regulationGroup.findMany({
                where: { portfolioId: { in: myPortfolioIds } },
                select: { id: true, name: true },
            });

            regulationUnits = await prisma.regulationUnit.findMany({
                where: { group: { portfolioId: { in: myPortfolioIds } } },
                select: { id: true, name: true },
            });
        }
    } else if (activeUser.role === UserRole.REG_GROUP_MANAGER) {
        const myGroupIds = activeUser.assets
            .filter((a) => a.assetType === AssetType.REGULATION_GROUP && a.id != null)
            .map((a) => a.id as number);

        if (myGroupIds.length) {
            regulationGroups = [];

            regulationUnits = await prisma.regulationUnit.findMany({
                where: { groupId: { in: myGroupIds } },
                select: { id: true, name: true },
            });
        }
    } else if (activeUser.role === UserRole.UNIT_MANAGER) {
        const myUnitIds = activeUser.assets
            .filter((a) => a.assetType === AssetType.REGULATION_UNIT && a.id != null)
            .map((a) => a.id as number);

        if (myUnitIds.length) {
            regulationUnits = await prisma.regulationUnit.findMany({
                where: { id: { in: myUnitIds } },
                select: { id: true, name: true },
            });
        }
    }

    return { portfolios, regulationGroups, regulationUnits };
}
