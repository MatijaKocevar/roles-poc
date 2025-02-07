import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { name } = await request.json();
    const role = await prisma.role.create({
        data: { name },
    });
    const modules = await prisma.module.findMany();
    for (const moduleObject of modules) {
        await prisma.permission.create({
            data: {
                roleId: role.id,
                moduleId: moduleObject.id,
                canView: false,
                canEdit: false,
                canDelete: false,
                canCreate: false,
            },
        });
    }
    return NextResponse.json({ role, message: "New role created with default permissions." });
}
