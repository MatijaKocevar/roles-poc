import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { assignments } = await request.json();
    try {
        const updated = [];
        for (const a of assignments) {
            const rec = await prisma.userUnitPermission.update({
                where: { id: a.id },
                data: {
                    canView: a.permissions.canView,
                    canEdit: a.permissions.canEdit,
                    canDelete: a.permissions.canDelete,
                    canCreate: a.permissions.canCreate,
                },
            });
            updated.push(rec);
        }
        return NextResponse.json({ success: true, updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
