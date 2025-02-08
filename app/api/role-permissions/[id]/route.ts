import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roleId = Number(searchParams.get("id"));
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
            permissions: {
                include: {
                    module: true,
                },
            },
        },
    });

    return NextResponse.json(role);
}
