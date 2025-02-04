import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { name } = await request.json();
    const role = await prisma.role.create({
        data: { name },
    });
    const pages = await prisma.page.findMany();
    for (const page of pages) {
        await prisma.permission.create({
            data: {
                roleId: role.id,
                pageId: page.id,
                canView: false,
                canEdit: false,
                canDelete: false,
            },
        });
    }
    return NextResponse.json({ role, message: "New role created with default permissions." });
}
