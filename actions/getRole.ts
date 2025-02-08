"use server";

import prisma from "@/lib/prisma";

export async function getRole(roleId: string) {
    return await prisma.role.findUnique({
        where: { id: parseInt(roleId) },
        select: { name: true },
    });
}
