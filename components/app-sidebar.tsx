"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
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
import { useActiveUser } from "@/app/active-user-context";

// Remove static data and fetch modules dynamically.
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { hasPermission } = useActiveUser();
    const [modules, setModules] = useState<
        Array<{
            title: string;
            url: string;
            slug: string;
            submodules: { title: string; url: string; slug: string }[];
        }>
    >([]);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        async function fetchModules() {
            const res = await fetch("/api/modules");
            const data = await res.json();

            console.log("HWAATTT: ", data);

            setModules(data);
        }

        fetchModules();
    }, []);

    const toggleExpanded = (slug: string) =>
        setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

    const filteredModules = modules
        .map((item) => {
            if (item.submodules) {
                const allowedSubs = item.submodules.filter((sub) =>
                    hasPermission(sub.slug, "canView")
                );
                return { ...item, submodules: allowedSubs };
            }
            return item;
        })
        .filter((item) => hasPermission(item.slug, "canView"));

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
                <SidebarGroup>
                    <SidebarMenu>
                        {filteredModules.map((item) =>
                            item.submodules.length > 0 ? (
                                <div key={item.slug}>
                                    <div className="flex items-center justify-between">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>{item.title}</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <button
                                            onClick={() => toggleExpanded(item.slug)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            {expanded[item.slug] ? "–" : "+"}
                                        </button>
                                    </div>
                                    {expanded[item.slug] && (
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
