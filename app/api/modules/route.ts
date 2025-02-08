import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const modules = await prisma.module.findMany();
        const mainModules = modules.filter((module) => module.parentId === null);
        const data = mainModules.map((main) => ({
            title: main.name,
            slug: main.slug,
            url: "/" + main.slug,
            submodules: modules
                .filter((sub) => sub.parentId === main.id)
                .map((sub) => {
                    const subUrlSegment = sub.slug.replace(`${main.slug}-`, "");
                    return {
                        title: sub.name,
                        slug: sub.slug,
                        url: `/${main.slug}/${subUrlSegment}`,
                    };
                }),
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
