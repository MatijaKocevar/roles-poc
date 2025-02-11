import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetType } from "@prisma/client";
import { useState, useMemo } from "react";
import React from "react";

interface Permission {
    module: {
        id: number;
        name: string;
        parentId?: number | null;
    };
    permission: "VIEW" | "MANAGE";
}

interface AssetDetailsProps {
    selectedAsset: {
        id: number;
        name: string;
        assetType: AssetType;
        accessProfiles: any[];
    };
    onRemoveAsset: (assetId: number, assetType: AssetType) => Promise<void>;
    onAddRole: (assetId: number, assetType: AssetType) => Promise<void>;
    onRemoveRole: (assetId: number, assetType: AssetType, accessProfileId: number) => Promise<void>;
    onRoleChange: (assetId: number, assetType: AssetType, accessProfileId: number) => void;
    selectedRoles: { [key: string]: number };
    accessProfiles: Array<{ id: number; name: string }>;
    assetKeyString: (assetId: number, assetType: AssetType) => string;
}

export function AssetDetails({
    selectedAsset,
    onRemoveAsset,
    onAddRole,
    onRemoveRole,
    onRoleChange,
    selectedRoles,
    accessProfiles,
    assetKeyString,
}: AssetDetailsProps) {
    const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false);

    const uniquePermissions = useMemo(() => {
        const permissionsMap = new Map<
            string,
            {
                moduleId: number;
                moduleName: string;
                parentId?: number | null;
                permissions: {
                    type: "VIEW" | "MANAGE";
                    sourceProfiles: string[];
                }[];
            }
        >();

        selectedAsset.accessProfiles.forEach((profile) => {
            profile.permissions?.forEach((perm: Permission) => {
                const key = `${perm.module.id}`;
                if (!permissionsMap.has(key)) {
                    permissionsMap.set(key, {
                        moduleId: perm.module.id,
                        moduleName: perm.module.name,
                        parentId: perm.module.parentId,
                        permissions: [
                            {
                                type: perm.permission,
                                sourceProfiles: [profile.name],
                            },
                        ],
                    });
                } else {
                    const existing = permissionsMap.get(key)!;
                    const existingPerm = existing.permissions.find(
                        (p) => p.type === perm.permission
                    );

                    if (existingPerm) {
                        if (!existingPerm.sourceProfiles.includes(profile.name)) {
                            existingPerm.sourceProfiles.push(profile.name);
                        }
                    } else {
                        existing.permissions.push({
                            type: perm.permission,
                            sourceProfiles: [profile.name],
                        });
                    }
                }
            });
        });

        const groupedPermissions: Array<{
            module: {
                moduleId: number;
                moduleName: string;
                permissions: { type: "VIEW" | "MANAGE"; sourceProfiles: string[] }[];
            };
            submodules: Array<{
                moduleId: number;
                moduleName: string;
                permissions: { type: "VIEW" | "MANAGE"; sourceProfiles: string[] }[];
            }>;
        }> = [];

        Array.from(permissionsMap.values())
            .filter((module) => !module.parentId)
            .forEach((parentModule) => {
                groupedPermissions.push({
                    module: {
                        moduleId: parentModule.moduleId,
                        moduleName: parentModule.moduleName,
                        permissions: parentModule.permissions,
                    },
                    submodules: [],
                });
            });

        Array.from(permissionsMap.values())
            .filter((module) => module.parentId)
            .forEach((submodule) => {
                const parentGroup = groupedPermissions.find(
                    (group) => group.module.moduleId === submodule.parentId
                );
                if (parentGroup) {
                    parentGroup.submodules.push({
                        moduleId: submodule.moduleId,
                        moduleName: submodule.moduleName,
                        permissions: submodule.permissions,
                    });
                }
            });

        return groupedPermissions;
    }, [selectedAsset.accessProfiles]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {selectedAsset.assetType}: {selectedAsset.name}
                </h2>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveAsset(selectedAsset.id, selectedAsset.assetType)}
                >
                    Remove Asset
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="font-medium mb-2">Access Profiles</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <select
                            className="h-8 rounded-md border border-input px-3"
                            value={
                                selectedRoles[
                                    assetKeyString(selectedAsset.id, selectedAsset.assetType)
                                ] || ""
                            }
                            onChange={(e) =>
                                onRoleChange(
                                    selectedAsset.id,
                                    selectedAsset.assetType,
                                    parseInt(e.target.value)
                                )
                            }
                        >
                            <option value="">Select Access Profile</option>
                            {accessProfiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            size="sm"
                            onClick={() => onAddRole(selectedAsset.id, selectedAsset.assetType)}
                        >
                            Add
                        </Button>
                    </div>
                    <ul className="space-y-2 mb-6">
                        {selectedAsset.accessProfiles.map((profile) => (
                            <li
                                key={profile.id}
                                className="flex items-center justify-between bg-accent/50 p-2 rounded"
                            >
                                <span>{profile.name}</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        onRemoveRole(
                                            selectedAsset.id,
                                            selectedAsset.assetType,
                                            profile.id
                                        )
                                    }
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div
                        className="flex items-center gap-2 mb-2 cursor-pointer"
                        onClick={() => setIsPermissionsExpanded(!isPermissionsExpanded)}
                    >
                        <ChevronRight
                            className={cn(
                                "h-4 w-4 transition-transform",
                                isPermissionsExpanded && "rotate-90"
                            )}
                        />
                        <h3 className="font-medium">Aggregated Permissions</h3>
                    </div>

                    {isPermissionsExpanded && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-fit whitespace-nowrap">
                                        Module
                                    </TableHead>
                                    <TableHead>Permission</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uniquePermissions.map((group) => (
                                    <React.Fragment key={group.module.moduleId}>
                                        <TableRow>
                                            <TableCell className="w-fit whitespace-nowrap">
                                                {group.module.moduleName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-row gap-2 flex-wrap">
                                                    {group.module.permissions.map((p) => (
                                                        <React.Fragment key={p.type}>
                                                            {p.sourceProfiles.map((profile) => (
                                                                <div
                                                                    key={`${profile}-${p.type}`}
                                                                    className="border rounded px-2 py-1 bg-gray-50"
                                                                >
                                                                    <span className="text-xs flex items-center gap-1">
                                                                        {profile}
                                                                        <span>→</span>
                                                                        <span
                                                                            className={cn(
                                                                                "px-2 py-0.5 rounded font-medium",
                                                                                p.type === "MANAGE"
                                                                                    ? "bg-blue-100 text-blue-700"
                                                                                    : "bg-gray-100 text-gray-700"
                                                                            )}
                                                                        >
                                                                            {p.type}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {group.submodules.map((submodule) => (
                                            <TableRow key={submodule.moduleId}>
                                                <TableCell className="w-fit whitespace-nowrap">
                                                    <div className="pl-6">
                                                        {submodule.moduleName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-row gap-2 flex-wrap">
                                                        {submodule.permissions.map((p) => (
                                                            <React.Fragment key={p.type}>
                                                                {p.sourceProfiles.map((profile) => (
                                                                    <div
                                                                        key={`${profile}-${p.type}`}
                                                                        className="border rounded px-2 py-1 bg-gray-50"
                                                                    >
                                                                        <span className="text-xs flex items-center gap-1">
                                                                            {profile}
                                                                            <span>→</span>
                                                                            <span
                                                                                className={cn(
                                                                                    "px-2 py-0.5 rounded font-medium",
                                                                                    p.type ===
                                                                                        "MANAGE"
                                                                                        ? "bg-blue-100 text-blue-700"
                                                                                        : "bg-gray-100 text-gray-700"
                                                                                )}
                                                                            >
                                                                                {p.type}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
