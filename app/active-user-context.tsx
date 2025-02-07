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
    moduleSlug: string;
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
    [moduleSlug: string]: Permission;
};

type ActiveUserContextType = {
    user: ActiveUser | null;
    permissions: AggregatedPermissions;
    hasPermission: (moduleSlug: string, permKey: keyof Permission) => boolean;
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
                    const moduleKey = perm.moduleSlug;
                    if (!agg[moduleKey]) {
                        agg[moduleKey] = {
                            canView: false,
                            canEdit: false,
                            canDelete: false,
                            canCreate: false,
                        };
                    }
                    agg[moduleKey].canView = agg[moduleKey].canView || perm.permission.canView;
                    agg[moduleKey].canEdit = agg[moduleKey].canEdit || perm.permission.canEdit;
                    agg[moduleKey].canDelete =
                        agg[moduleKey].canDelete || perm.permission.canDelete;
                    agg[moduleKey].canCreate =
                        agg[moduleKey].canCreate || perm.permission.canCreate;
                }
            }

            console.log(user);

            setPermissions(agg);
        } else {
            setPermissions({});
        }
    }, [user]);

    const hasPermission = (moduleSlug: string, permKey: keyof Permission) => {
        return permissions[moduleSlug]?.[permKey] || false;
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
