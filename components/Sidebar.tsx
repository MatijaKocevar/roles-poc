"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getActiveUser, getUserAccess } from "@/actions/user";
import { ModuleAccess } from "@/types/user";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User } from "@/app/active-user-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [modules, setModules] = useState<ModuleAccess[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchModules() {
            try {
                const userData = await getActiveUser();
                if (userData?.activeUser) {
                    const accessData = await getUserAccess(userData.activeUser.assets);
                    const accessibleModules =
                        userData.activeUser.role === "SUPER_ADMIN"
                            ? accessData.moduleAccess
                            : accessData.moduleAccess.filter((m) => m.hasAccess);
                    setModules(accessibleModules);
                }
            } catch (error) {
                console.error("Error fetching modules:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchModules();
    }, []);

    const staticItems = useMemo(
        () => [
            {
                title: "Assets",
                url: "/assets",
                slug: "assets",
                submodules: [
                    { title: "Portfolios", url: "/assets/portfolios", slug: "assets-portfolios" },
                    {
                        title: "Groups",
                        url: "/assets/regulation-groups",
                        slug: "regulation-groups",
                    },
                    { title: "Units", url: "/assets/regulation-units", slug: "regulation-units" },
                ],
            },
            {
                title: "Settings",
                url: "/settings",
                slug: "settings",
                submodules: [
                    { title: "General", url: "/settings/general", slug: "settings-general" },
                    { title: "Account", url: "/settings/account", slug: "settings-account" },
                ],
            },
        ],
        []
    );

    useEffect(() => {
        const allItems = [...staticItems, ...formatModulesForSidebar(modules)];
        for (const item of allItems) {
            if (item.url === pathname || item.submodules.some((sub) => sub.url === pathname)) {
                setExpanded(item.slug);
                break;
            }
        }
    }, [modules, pathname, staticItems]);

    const toggleExpanded = (slug: string) => setExpanded(expanded === slug ? null : slug);

    const formatModulesForSidebar = (modules: ModuleAccess[]) => {
        const mainModules = modules.filter((m) => !m.parentId);

        return mainModules.map((main) => ({
            title: main.name,
            url: `/${main.slug}`,
            slug: main.slug,
            submodules: modules
                .filter((sub) => sub.parentId === main.id)
                .map((sub) => ({
                    title: sub.name,
                    url: `/${main.slug}/${sub.slug.replace(`${main.slug}-`, "")}`,
                    slug: sub.slug,
                })),
        }));
    };

    const displayedModules = formatModulesForSidebar(modules);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square w-8 h-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">FLEX</span>
                                    <span>v3.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Static Items */}
                <SidebarGroup>
                    <SidebarMenu>
                        {staticItems.map((item) => (
                            <ModuleMenuItem
                                key={item.slug}
                                item={item}
                                expanded={expanded}
                                toggleExpanded={toggleExpanded}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Dynamic Modules */}
                <SidebarGroup>
                    <SidebarMenu>
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            displayedModules.map((item) => (
                                <ModuleMenuItem
                                    key={item.slug}
                                    item={item}
                                    expanded={expanded}
                                    toggleExpanded={toggleExpanded}
                                />
                            ))
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

function ModuleMenuItem({
    item,
    expanded,
    toggleExpanded,
}: {
    item: {
        title: string;
        url: string;
        slug: string;
        submodules: { title: string; url: string; slug: string }[];
    };
    expanded: string | null;
    toggleExpanded: (slug: string) => void;
}) {
    if (item.submodules.length > 0) {
        return (
            <div>
                <div className="flex items-center justify-between">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={item.url} onClick={() => toggleExpanded(item.slug)}>
                                <div>{item.title}</div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(item.slug);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                        {expanded === item.slug ? "–" : "+"}
                    </span>
                </div>
                {expanded === item.slug && (
                    <div className="ml-4">
                        {item.submodules.map((sub) => (
                            <SidebarMenuItem key={sub.slug}>
                                <SidebarMenuButton asChild>
                                    <Link href={sub.url}>{sub.title}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href={item.url}>{item.title}</Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
