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
    moduleId: number;
    moduleName: string;
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
    [moduleName: string]: Permission;
};

type ActiveUserContextType = {
    user: ActiveUser | null;
    permissions: AggregatedPermissions;
    hasPermission: (moduleName: string, permKey: keyof Permission) => boolean;
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
                    const moduleObject = perm.moduleName;
                    if (!agg[moduleObject]) {
                        agg[moduleObject] = {
                            canView: false,
                            canEdit: false,
                            canDelete: false,
                            canCreate: false,
                        };
                    }
                    agg[moduleObject].canView =
                        agg[moduleObject].canView || perm.permission.canView;
                    agg[moduleObject].canEdit =
                        agg[moduleObject].canEdit || perm.permission.canEdit;
                    agg[moduleObject].canDelete =
                        agg[moduleObject].canDelete || perm.permission.canDelete;
                    agg[moduleObject].canCreate =
                        agg[moduleObject].canCreate || perm.permission.canCreate;
                }
            }
            setPermissions(agg);
        } else {
            setPermissions({});
        }
    }, [user]);

    const hasPermission = (moduleName: string, permKey: keyof Permission) => {
        return permissions[moduleName]?.[permKey] || false;
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
