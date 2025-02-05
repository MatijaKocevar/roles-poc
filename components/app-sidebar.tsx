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
            title: "Portfolios",
            url: "/portfolios",
            subpages: [
                { title: "Overview", url: "/portfolios/overview" },
                { title: "Manage Portfolios", url: "/portfolios/manage" },
            ],
        },
        {
            title: "Contracts",
            url: "/contracts",
            subpages: [
                { title: "Overview", url: "/contracts/overview" },
                { title: "Manage Contracts", url: "/contracts/manage" },
            ],
        },
        {
            title: "Analytics",
            url: "/analytics",
            subpages: [
                { title: "Overview", url: "/analytics/overview" },
                { title: "Reports", url: "/analytics/reports" },
                { title: "Data Export", url: "/analytics/data-export" },
            ],
        },
        {
            title: "Assets",
            url: "/assets",
            subpages: [
                { title: "Overview", url: "/assets/overview" },
                { title: "Manage Assets", url: "/assets/manage" },
            ],
        },
        {
            title: "Billing & Payments",
            url: "/billing-payments",
            subpages: [
                { title: "Invoices", url: "/billing-payments/invoices" },
                { title: "Payment Methods", url: "/billing-payments/payment-methods" },
                { title: "Payment History", url: "/billing-payments/payment-history" },
            ],
        },
        {
            title: "Dashboard",
            url: "/dashboard",
            subpages: [
                { title: "Summary", url: "/dashboard/summary" },
                { title: "Notifications", url: "/dashboard/notifications" },
                { title: "Activity Log", url: "/dashboard/activity-log" },
            ],
        },
        {
            title: "Marketing",
            url: "/marketing",
            subpages: [
                { title: "Campaigns", url: "/marketing/campaigns" },
                { title: "Leads", url: "/marketing/leads" },
                { title: "Performance", url: "/marketing/performance" },
            ],
        },
        {
            title: "Monitoring",
            url: "/monitoring",
            subpages: [
                { title: "System Status", url: "/monitoring/system-status" },
                { title: "Logs", url: "/monitoring/logs" },
                { title: "Alerts", url: "/monitoring/alerts" },
            ],
        },
        {
            title: "Security",
            url: "/security",
            subpages: [
                { title: "User Management", url: "/security/users" },
                { title: "Role Management", url: "/security/roles" },
                { title: "Audit Logs", url: "/security/audit-logs" },
            ],
        },
        {
            title: "Settings",
            url: "/settings",
            subpages: [
                { title: "General", url: "/settings/general" },
                { title: "Preferences", url: "/settings/preferences" },
                { title: "Integrations", url: "/settings/integrations" },
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
            if (item.subpages) {
                const allowedSubpages = item.subpages.filter((sub) =>
                    hasPermission(sub.title, "canView")
                );

                return { ...item, subpages: allowedSubpages };
            }

            return item;
        })
        .filter((item) => {
            if (item.subpages) {
                return hasPermission(item.title, "canView");
            }

            hasPermission(item.title, "canView");

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
                            item.subpages ? (
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
                                    {expanded[item.title] && item.subpages.length > 0 && (
                                        <div className="ml-4">
                                            {item.subpages.map((sub) => (
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
