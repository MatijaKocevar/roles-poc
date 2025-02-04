import * as React from "react";
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

const data = {
    navMain: [
        { title: "Users", url: "/users" },
        { title: "Roles", url: "/roles" },
        { title: "Portfolios", url: "/portfolios" },
        { title: "Contracts", url: "/contracts" },
        { title: "Analytics", url: "/analytics" },
        { title: "Assets", url: "/assets" },
        { title: "Billing & Payments", url: "/billing-payments" },
        { title: "Dashboard", url: "/dashboard" },
        { title: "Marketing", url: "/marketing" },
        { title: "Monitoring", url: "/monitoring" },
        {
            title: "Security",
            url: "/security",
            subpages: [
                { title: "Roles", url: "/security/roles" },
                { title: "Users", url: "/security/users" },
            ],
        },
        { title: "Settings", url: "/settings" },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
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
                        {data.navMain.map((item) =>
                            item.subpages ? (
                                <div key={item.title}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url}>{item.title}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <div className="ml-4">
                                        {item.subpages.map((sub) => (
                                            <SidebarMenuItem key={sub.title}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={sub.url}>{sub.title}</Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </div>
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
