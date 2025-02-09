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
    SidebarRail,
} from "@/components/ui/sidebar";
import { getModules } from "../actions/modules";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [modules, setModules] = useState<
        Array<{
            title: string;
            url: string;
            slug: string;
            submodules: { title: string; url: string; slug: string }[];
        }>
    >([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchModules() {
            const data = await getModules();

            setModules(data);
        }

        fetchModules();
    }, []);

    // Add static always-present items
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

    // Set expanded module based on the current pathname.
    useEffect(() => {
        const allItems = [...staticItems, ...modules];
        for (const item of allItems) {
            if (item.url === pathname || item.submodules.some((sub) => sub.url === pathname)) {
                setExpanded(item.slug);
                break;
            }
        }
    }, [modules, pathname, staticItems]);

    const toggleExpanded = (slug: string) => setExpanded(expanded === slug ? null : slug);

    const displayedModules = modules;

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
                                    <span>v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Add static always-present items */}
                <SidebarGroup>
                    <SidebarMenu>
                        {staticItems.map((item) =>
                            item.submodules.length > 0 ? (
                                <div key={item.slug}>
                                    <div className="flex items-center justify-between">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <Link
                                                    href={item.url}
                                                    onClick={() => toggleExpanded(item.slug)}
                                                >
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
                            ) : (
                                <SidebarMenuItem key={item.slug}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>{item.title}</Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Add dynamic modules */}
                <SidebarGroup>
                    <SidebarMenu>
                        {displayedModules.map((item) =>
                            item.submodules.length > 0 ? (
                                <div key={item.slug}>
                                    <div className="flex items-center justify-between">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <Link
                                                    href={item.url}
                                                    onClick={() => toggleExpanded(item.slug)}
                                                >
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
                            ) : (
                                <SidebarMenuItem key={item.slug}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>{item.title}</Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
