import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { userId } = await request.json();

    const active = await prisma.activeUser.upsert({
        where: { id: 1 },
        update: { userId },
        create: { id: 1, userId },
    });

    return NextResponse.json({ success: true, active });
}
