"use server";

import prisma from "@/lib/prisma";

export async function getModules() {
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

    return data;
}

export async function getModulesTree() {
    const modules = await prisma.module.findMany();
    const mainModules = modules.filter((m) => m.parentId === null);
    return mainModules.map((main) => ({
        id: main.id,
        title: main.name,
        slug: main.slug,
        submodules: modules
            .filter((sub) => sub.parentId === main.id)
            .map((sub) => ({
                id: sub.id,
                title: sub.name,
                slug: sub.slug,
            })),
    }));
}
