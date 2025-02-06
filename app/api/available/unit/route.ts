import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const portfolioId = Number(searchParams.get("portfolioId"));

    const available = await prisma.regulationGroup.findMany({
        where: { portfolioId },
        select: { id: true, name: true },
    });
    return NextResponse.json(available);
}
