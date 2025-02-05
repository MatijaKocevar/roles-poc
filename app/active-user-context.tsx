"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Permission = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
};

type RolePermission = {
    roleId: number;
    pageId: number;
    pageName: string;
    permission: Permission;
};

type Role = {
    id: number;
    name: string;
    permissions: RolePermission[];
};

export type ActiveUser = {
    id: number;
    email: string;
    roles: Role[];
};

type AggregatedPermissions = {
    [pageName: string]: Permission;
};

type ActiveUserContextType = {
    user: ActiveUser | null;
    permissions: AggregatedPermissions;
    hasPermission: (pageName: string, permKey: keyof Permission) => boolean;
    setUser: (user: ActiveUser | null) => void;
};

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ActiveUser | null>(null);
    const [permissions, setPermissions] = useState<AggregatedPermissions>({});

    useEffect(() => {
        async function fetchActiveUser() {
            try {
                const res = await fetch("/api/active-user");
                if (res.ok) {
                    const data = await res.json();
                    if (data.activeUser) {
                        setUser(data.activeUser);
                    }
                }
            } catch (err) {
                console.error("Error fetching active user", err);
            }
        }
        fetchActiveUser();
    }, []);

    useEffect(() => {
        if (user) {
            const agg: AggregatedPermissions = {};
            for (const role of user.roles) {
                for (const perm of role.permissions) {
                    const page = perm.pageName;
                    if (!agg[page]) {
                        agg[page] = {
                            canView: false,
                            canEdit: false,
                            canDelete: false,
                            canCreate: false,
                        };
                    }
                    agg[page].canView = agg[page].canView || perm.permission.canView;
                    agg[page].canEdit = agg[page].canEdit || perm.permission.canEdit;
                    agg[page].canDelete = agg[page].canDelete || perm.permission.canDelete;
                    agg[page].canCreate = agg[page].canCreate || perm.permission.canCreate;
                }
            }
            setPermissions(agg);
        } else {
            setPermissions({});
        }
    }, [user]);

    const hasPermission = (pageName: string, permKey: keyof Permission) => {
        return permissions[pageName]?.[permKey] || false;
    };

    if (user === null) {
        return <div>Loading...</div>;
    }

    return (
        <ActiveUserContext.Provider value={{ user, permissions, hasPermission, setUser }}>
            {children}
        </ActiveUserContext.Provider>
    );
}

export function useActiveUser() {
    const context = useContext(ActiveUserContext);
    if (!context) {
        throw new Error("useActiveUser must be used within an ActiveUserProvider");
    }
    return context;
}
