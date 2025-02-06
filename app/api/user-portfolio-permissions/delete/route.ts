import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        const deletedRecord = await prisma.userPortfolioPermission.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, deleted: deletedRecord });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
