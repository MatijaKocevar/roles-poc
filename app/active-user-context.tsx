"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Module = {
    id: number;
    name: string;
    slug: string;
};

type Permission = {
    id: number;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
    module: Module;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

export type ActiveAsset = {
    id: number;
    name: string;
    assetType: string;
    roles: Role[];
};

export type ActiveUser = {
    id: number;
    email: string;
    assets: ActiveAsset[];
};

type ActiveUserContextType = {
    user: ActiveUser | null;
    setUser: (user: ActiveUser | null) => void;
};

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ActiveUser | null>(null);

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

    if (user === null) {
        return <div>Loading...</div>;
    }

    return (
        <ActiveUserContext.Provider value={{ user, setUser }}>
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
