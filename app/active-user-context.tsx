"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FlatAsset, getActiveUser } from "../actions/user";

type Module = {
    id: number;
    name: string;
    parentId: number | null;
    slug: string;
};

type Permission = {
    id: number;
    moduleId: number;
    accessProfileId: number;
    permission: "VIEW" | "MANAGE";
    module: Module;
};

// Renamed Role to AccessProfile
type AccessProfile = {
    id: number;
    name: string;
    permissions: Permission[];
};

export type ActiveAsset = {
    id: number;
    name: string;
    assetType: string;
    // Updated key to reflect the renaming
    accessProfiles: AccessProfile[];
};

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role:
        | "SUPER_ADMIN"
        | "COMPANY_MANAGER"
        | "PORTFOLIO_MANAGER"
        | "REG_GROUP_MANAGER"
        | "UNIT_MANAGER";
    assets: FlatAsset[];
    company: {
        id: number;
        name: string;
    } | null;
}

type ActiveUserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    hasPermission: (moduleSlug: string, permKey: keyof Permission) => boolean;
};

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchActiveUser() {
            const res = await getActiveUser();

            if (res?.activeUser) {
                setUser(res.activeUser);
            }
        }
        fetchActiveUser();
    }, []);

    const hasPermission = (moduleSlug: string, permKey: keyof Permission) => {
        return true;
    };

    if (user === null) {
        return <div>Loading...</div>;
    }

    return (
        <ActiveUserContext.Provider value={{ user, setUser, hasPermission }}>
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
