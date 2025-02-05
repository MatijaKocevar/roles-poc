import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    const assigned = await prisma.userPortfolioPermission.findMany({
        where: { userId },
        select: { portfolioId: true },
    });
    const assignedIds = assigned.map((p) => p.portfolioId);

    const available = await prisma.portfolio.findMany({
        where: { id: { notIn: assignedIds } },
        select: { id: true, name: true },
    });

    return NextResponse.json(available);
}
