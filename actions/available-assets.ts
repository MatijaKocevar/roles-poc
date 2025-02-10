"use server";

import prisma from "@/lib/prisma";
import { AssetType, UserRole } from "@prisma/client";
import { getActiveUser } from "@/actions/user";

// Define a type for assets returned from our queries.
interface AssetOption {
    id: number;
    name: string;
}

export async function getAvailableAssets() {
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
