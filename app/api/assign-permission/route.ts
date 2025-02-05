import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const { userId, type, id, permissions } = await request.json();
    try {
        let result;
        if (type === "portfolio") {
            result = await prisma.userPortfolioPermission.create({
                data: {
                    userId,
                    portfolioId: id,
                    canView: permissions.canView,
                    canEdit: permissions.canEdit,
                    canDelete: permissions.canDelete,
                    canCreate: permissions.canCreate,
                },
            });
        } else if (type === "group") {
            result = await prisma.userGroupPermission.create({
                data: {
                    userId,
                    groupId: id,
                    canView: permissions.canView,
                    canEdit: permissions.canEdit,
                    canDelete: permissions.canDelete,
                    canCreate: permissions.canCreate,
                },
            });
        } else if (type === "unit") {
            result = await prisma.userUnitPermission.create({
                data: {
                    userId,
                    unitId: id,
                    canView: permissions.canView,
                    canEdit: permissions.canEdit,
                    canDelete: permissions.canDelete,
                    canCreate: permissions.canCreate,
                },
            });
        } else {
            return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
        }
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
