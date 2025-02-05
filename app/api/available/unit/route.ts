import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));
    const groupId = Number(searchParams.get("groupId"));

    const assigned = await prisma.userUnitPermission.findMany({
        where: { userId },
        select: { unitId: true },
    });
    const assignedIds = assigned.map((u) => u.unitId);

    const available = await prisma.regulationUnit.findMany({
        where: {
            groupId,
            id: { notIn: assignedIds },
        },
        select: { id: true, name: true },
    });

    return NextResponse.json(available);
}
