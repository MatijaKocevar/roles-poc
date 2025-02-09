"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAssetToUser(userId: number, assetId: number, assetType: string) {
    try {
        await prisma.userAsset.create({
            data: {
                userId: userId,
                assetId: assetId,
                assetType: assetType,
            },
        });
        revalidatePath(`/`); // Revalidate the home page to reflect changes
        return { success: true };
    } catch (error) {
        console.error("Error adding asset to user:", error);
        return { success: false, error: "Failed to add asset to user" };
    }
}

export async function removeAssetFromUser(userId: number, assetId: number, assetType: string) {
    try {
        await prisma.userAsset.deleteMany({
            where: {
                userId: userId,
                assetId: assetId,
                assetType: assetType,
            },
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
    roleId: number,
    assetId: number,
    assetType: string
) {
    await prisma.userAssetRole.create({
        data: { userId, roleId, assetId, assetType },
    });
}

export async function removeRoleFromAsset(
    userId: number,
    roleId: number,
    assetId: number,
    assetType: string
) {
    await prisma.userAssetRole.deleteMany({
        where: { userId, roleId, assetId, assetType },
    });
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
        const roles = await prisma.role.findMany({ select: { id: true, name: true } });
        return roles;
    } catch (error) {
        console.error("Error fetching roles:", error);
        return [];
    }
}

export async function getAssetTypeById(assetId: number): Promise<string | null> {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: assetId } });
    if (portfolio) return "Portfolio";

    const regulationGroup = await prisma.regulationGroup.findUnique({
        where: { id: assetId },
    });
    if (regulationGroup) return "RegulationGroup";

    const regulationUnit = await prisma.regulationUnit.findUnique({ where: { id: assetId } });
    if (regulationUnit) return "RegulationUnit";

    return null;
}
