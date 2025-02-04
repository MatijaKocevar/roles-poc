import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { userId, roleIds } = await request.json();
    const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: {
            roles: {
                set: roleIds.map((id: number) => ({ id })),
            },
        },
    });
    return NextResponse.json({ message: "User roles updated", user: updatedUser });
}
