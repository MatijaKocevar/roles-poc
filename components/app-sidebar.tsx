"use client";

import * as React from "react";
import { useState } from "react";
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

const data = {
    navMain: [
        {
            title: "Archive",
            url: "/archive",
            submodules: [{ title: "Archive Realtime", url: "/archive/realtime" }],
        },
        {
            title: "Assets",
            url: "/assets",
            submodules: [
                { title: "Portfolios", url: "/assets/portfolios" },
                { title: "Regulation Groups", url: "/assets/regulation-groups" },
                { title: "Regulation Units", url: "/assets/regulation-units" },
            ],
        },
        {
            title: "Contracts",
            url: "/contracts",
            submodules: [
                { title: "Contracts Overview", url: "/contracts/overview" },
                { title: "Contracts History", url: "/contracts/history" },
            ],
        },
        {
            title: "Management",
            url: "/management",
            submodules: [
                { title: "Management Users", url: "/management/users" },
                { title: "Management Roles", url: "/management/roles" },
                { title: "Management Companies", url: "/management/companies" },
            ],
        },
        {
            title: "Models",
            url: "/models",
            submodules: [
                { title: "Models Optimization", url: "/models/optimization" },
                { title: "Models Activation", url: "/models/activation" },
            ],
        },
        {
            title: "Reports",
            url: "/reports",
            submodules: [
                { title: "Reports Settlements", url: "/reports/settlements" },
                { title: "Reports Logs", url: "/reports/logs" },
            ],
        },
        {
            title: "System",
            url: "/system",
            submodules: [
                { title: "System Overview", url: "/system/overview" },
                { title: "System Settings", url: "/system/settings" },
            ],
        },
        {
            title: "Trading",
            url: "/trading",
            submodules: [
                { title: "Trading Overview", url: "/trading/overview" },
                { title: "Trading History", url: "/trading/history" },
                { title: "Trading Autobidder", url: "/trading/autobidder" },
            ],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { hasPermission } = useActiveUser();
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    const toggleExpanded = (title: string) =>
        setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

    const filteredNavMain = data.navMain
        .map((item) => {
            if (item.submodules) {
                const allowedSubmodules = item.submodules.filter((sub) =>
                    hasPermission(sub.title, "canView")
                );

                return { ...item, submodules: allowedSubmodules };
            }

            return item;
        })
        .filter((item) => {
            return hasPermission(item.title, "canView");
        });

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
                        {filteredNavMain.map((item) =>
                            item.submodules ? (
                                <div key={item.title}>
                                    <div className="flex items-center justify-between">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>{item.title}</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <button
                                            onClick={() => toggleExpanded(item.title)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            {expanded[item.title] ? "–" : "+"}
                                        </button>
                                    </div>
                                    {expanded[item.title] && item.submodules.length > 0 && (
                                        <div className="ml-4">
                                            {item.submodules.map((sub) => (
                                                <SidebarMenuItem key={sub.title}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={sub.url}>{sub.title}</Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <SidebarMenuItem key={item.title}>
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
