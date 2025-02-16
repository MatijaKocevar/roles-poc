import { AssetType, PermissionType } from "@prisma/client";

export interface AccessProfileWithSource {
    id: number;
    name: string;
    source?: {
        type: AssetType;
        id: number;
        name: string;
    };
    permissions: {
        id: number;
        permission: PermissionType;
        module: {
            id: number;
            name: string;
            parentId: number | null;
            slug: string;
        };
    }[];
}

export interface FlatAsset {
    assetType: AssetType;
    id: number | null;
    name: string | null;
    portfolioId?: number;
    groupId?: number;
    accessProfiles: AccessProfileWithSource[];
}

export interface AssetAccess {
    assetType: AssetType;
    id: number;
    name: string;
    portfolioId?: number;
    groupId?: number;
    accessProfiles: {
        id: number;
        name: string;
        modulePermissions: {
            moduleId: number;
            permission: PermissionType;
        }[];
        source?: {
            type: AssetType;
            id: number;
            name: string;
        };
    }[];
}

export interface ModuleAccess {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    hasAccess: boolean;
    permission: PermissionType;
}

export interface UserAccessData {
    moduleAccess: ModuleAccess[];
    assetAccess: AssetAccess[];
}
