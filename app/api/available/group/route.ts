import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));
    const portfolioId = Number(searchParams.get("portfolioId"));

    const assigned = await prisma.userGroupPermission.findMany({
        where: { userId },
        select: { groupId: true },
    });
    const assignedIds = assigned.map((g) => g.groupId);
    const available = await prisma.regulationGroup.findMany({
        where: {
            portfolioId,
            id: { notIn: assignedIds },
        },
        select: { id: true, name: true },
    });

    return NextResponse.json(available);
}
