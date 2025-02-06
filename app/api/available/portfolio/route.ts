import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const available = await prisma.portfolio.findMany({
        select: { id: true, name: true },
    });

    return NextResponse.json(available);
}
