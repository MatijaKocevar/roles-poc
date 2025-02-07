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
            title: "Billing & Payments",
            url: "/billing-payments",
            submodules: [
                { title: "Invoices", url: "/billing-payments/invoices" },
                { title: "Payment Methods", url: "/billing-payments/payment-methods" },
                { title: "Payment History", url: "/billing-payments/payment-history" },
            ],
        },
        {
            title: "Contracts",
            url: "/contracts",
            submodules: [
                { title: "Overview", url: "/contracts/overview" },
                { title: "Manage Contracts", url: "/contracts/manage" },
            ],
        },
        {
            title: "Marketing",
            url: "/marketing",
            submodules: [
                { title: "Campaigns", url: "/marketing/campaigns" },
                { title: "Leads", url: "/marketing/leads" },
                { title: "Performance", url: "/marketing/performance" },
            ],
        },
        {
            title: "Monitoring",
            url: "/monitoring",
            submodules: [
                { title: "System Status", url: "/monitoring/system-status" },
                { title: "Logs", url: "/monitoring/logs" },
                { title: "Alerts", url: "/monitoring/alerts" },
            ],
        },
        {
            title: "Portfolios",
            url: "/portfolios",
            submodules: [],
        },
        {
            title: "Regulation Groups",
            url: "/regulation-groups",
            submodules: [],
        },
        {
            title: "Regulation Units",
            url: "/regulation-units",
            submodules: [],
        },
        {
            title: "Dashboard",
            url: "/dashboard",
            submodules: [
                { title: "Summary", url: "/dashboard/summary" },
                { title: "Notifications", url: "/dashboard/notifications" },
                { title: "Activity Log", url: "/dashboard/activity-log" },
            ],
        },
        {
            title: "Security",
            url: "/security",
            submodules: [
                { title: "User Management", url: "/security/users" },
                { title: "Role Management", url: "/security/roles" },
                { title: "Audit Logs", url: "/security/audit-logs" },
            ],
        },
        {
            title: "Settings",
            url: "/settings",
            submodules: [
                { title: "General", url: "/settings/general" },
                { title: "Preferences", url: "/settings/preferences" },
                { title: "Integrations", url: "/settings/integrations" },
            ],
        },
        {
            title: "System Settings",
            url: "/system-settings",
            submodules: [],
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
