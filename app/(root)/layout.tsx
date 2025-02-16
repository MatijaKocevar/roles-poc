"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/Sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { useActiveUser } from "../active-user-context";

export default function Page({ children }: Readonly<{ children: ReactNode }>) {
    const pathname = usePathname();
    const pathSegments = pathname?.split("/").filter((segment) => segment !== "");

    const { user } = useActiveUser();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {pathSegments?.length ?? 0 > 0 ? (
                                pathSegments?.map((segment, index) => {
                                    const isLast = index === pathSegments?.length - 1;
                                    const isId = /^\d+$/.test(segment);
                                    const href = "/" + pathSegments?.slice(0, index + 1).join("/");
                                    return (
                                        <span key={href} className="flex items-center gap-1">
                                            {isId ? (
                                                <>
                                                    <div className="capitalize">
                                                        {decodeURIComponent(segment).replace(
                                                            /-/g,
                                                            " "
                                                        )}
                                                    </div>
                                                    {!isLast && <BreadcrumbSeparator />}
                                                </>
                                            ) : !isLast ? (
                                                <>
                                                    <Link href={href}>
                                                        <div className="capitalize">
                                                            {decodeURIComponent(segment).replace(
                                                                /-/g,
                                                                " "
                                                            )}
                                                        </div>
                                                    </Link>
                                                    <BreadcrumbSeparator />
                                                </>
                                            ) : (
                                                <div className="capitalize">
                                                    {decodeURIComponent(segment).replace(/-/g, " ")}
                                                </div>
                                            )}
                                        </span>
                                    );
                                })
                            ) : (
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Home</BreadcrumbPage>
                                </BreadcrumbItem>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex-1 text-right">{user?.email}</div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 max-w-[100vw]">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
