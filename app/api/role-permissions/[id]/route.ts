import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const roleId = Number(params.id);
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
