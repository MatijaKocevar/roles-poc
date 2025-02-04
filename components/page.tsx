"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Page() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter((segment) => segment !== "");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {pathSegments.length > 0 ? (
                                pathSegments.map((segment, index) => {
                                    const isLast = index === pathSegments.length - 1;
                                    const href = "/" + pathSegments.slice(0, index + 1).join("/");
                                    return (
                                        <BreadcrumbItem key={href}>
                                            {isLast ? (
                                                <BreadcrumbPage className="capitalize">
                                                    {decodeURIComponent(segment)}
                                                </BreadcrumbPage>
                                            ) : (
                                                <>
                                                    <Link href={href}>
                                                        <a>
                                                            <BreadcrumbLink className="capitalize">
                                                                {decodeURIComponent(segment)}
                                                            </BreadcrumbLink>
                                                        </a>
                                                    </Link>
                                                    <BreadcrumbSeparator />
                                                </>
                                            )}
                                        </BreadcrumbItem>
                                    );
                                })
                            ) : (
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Home</BreadcrumbPage>
                                </BreadcrumbItem>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
