"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { User } from "../app/active-user-context";
import {
    addAssetToUser,
    removeAssetFromUser,
    addRoleToAsset,
    removeRoleFromAsset,
    getAllRoles,
    getAssetTypeById,
} from "@/actions/user-assets";
import { getAvailableAssets } from "@/actions/available-assets";
import { Button } from "./ui/button";
import { AssetType } from "@prisma/client";
import { TreeDataItem, TreeView } from "./ui/tree-view";
import { useRouter } from "next/navigation";

interface UserInfoDisplayProps {
    user: User | undefined;
}

interface AssetOption {
    id: number;
    name: string;
}

interface RoleOption {
    id: number;
    name: string;
}

interface SelectedAsset {
    id: number;
    name: string;
    assetType: AssetType;
    accessProfiles: any[];
}

interface Asset {
    id: number;
    name: string;
    assetType: AssetType;
    portfolioId?: number; // For regulation groups
    groupId?: number; // For regulation units
    accessProfiles: any[];
}

export default function UserInfoDisplay({ user }: UserInfoDisplayProps) {
    const router = useRouter();
    const [newAsset, setNewAsset] = useState({
        assetId: 0,
        assetType: "" as AssetType | "",
        accessProfileId: 0,
    });
    const [portfolios, setPortfolios] = useState<AssetOption[]>([]);
    const [regulationGroups, setRegulationGroups] = useState<AssetOption[]>([]);
    const [regulationUnits, setRegulationUnits] = useState<AssetOption[]>([]);
    const [accessProfiles, setRoles] = useState<RoleOption[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<{ [assetKey: string]: number }>({});
    const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    function assetKeyString(assetId: number, assetType: AssetType) {
        return `${assetType}-${assetId}`;
    }

    useEffect(() => {
        const fetchData = async () => {
            const { portfolios, regulationGroups, regulationUnits } = await getAvailableAssets();

            setPortfolios(portfolios);
            setRegulationGroups(regulationGroups);
            setRegulationUnits(regulationUnits);

            const accessProfilesData = await getAllRoles();

            setRoles(accessProfilesData);
        };

        fetchData();
    }, [refreshTrigger]);

    const refreshUserData = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleAddAsset = async () => {
        if (user && newAsset.assetId && newAsset.assetType && newAsset.accessProfileId) {
            await addAssetToUser(user.id, newAsset.assetId, newAsset.assetType);
            await addRoleToAsset(
                user.id,
                newAsset.accessProfileId,
                newAsset.assetId,
                newAsset.assetType
            );
            setNewAsset({ assetId: 0, assetType: "", accessProfileId: 0 });
            router.refresh();
        }
    };

    const handleRemoveAsset = async (assetId: number, assetType: AssetType) => {
        if (user) {
            await removeAssetFromUser(user.id, assetId, assetType);
            router.refresh();
            setSelectedAsset(null);
        }
    };

    const handleAddRole = async (assetId: number, assetType: AssetType) => {
        if (user) {
            const currentKey = assetKeyString(assetId, assetType);
            const selectedRole = selectedRoles[currentKey];

            if (selectedRole) {
                await addRoleToAsset(user.id, selectedRole, assetId, assetType);
                router.refresh();
                setSelectedRoles((prev) => ({ ...prev, [currentKey]: 0 }));

                if (selectedAsset && selectedAsset.id === assetId) {
                    const newProfile = accessProfiles.find(
                        (profile) => profile.id === selectedRole
                    );
                    if (newProfile) {
                        setSelectedAsset({
                            ...selectedAsset,
                            accessProfiles: [...selectedAsset.accessProfiles, newProfile],
                        });
                    }
                }
            }
        }
    };

    const handleRemoveRole = async (
        assetId: number,
        assetType: AssetType,
        accessProfileId: number
    ) => {
        if (user) {
            await removeRoleFromAsset(user.id, accessProfileId, assetId, assetType);
            router.refresh();

            if (selectedAsset && selectedAsset.id === assetId) {
                setSelectedAsset({
                    ...selectedAsset,
                    accessProfiles: selectedAsset.accessProfiles.filter(
                        (profile) => profile.id !== accessProfileId
                    ),
                });
            }
        }
    };

    const handleAssetChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const assetId = parseInt(e.target.value);

        setNewAsset((prev) => ({ ...prev, assetId: assetId }));

        const assetType = await getAssetTypeById(assetId);

        if (assetType) {
            setNewAsset((prev) => ({ ...prev, assetType: assetType }));
        } else {
            setNewAsset((prev) => ({ ...prev, assetType: "" }));
        }
    };

    function handleRoleChange(assetId: number, assetType: AssetType, accessProfileId: number) {
        setSelectedRoles((prev) => ({
            ...prev,
            [assetKeyString(assetId, assetType)]: accessProfileId,
        }));
    }

    const constructTreeData = (): TreeDataItem[] => {
        if (!user?.assets) return [];

        // First, organize assets by type
        const portfolios = user.assets.filter(
            (asset) => asset.assetType === "PORTFOLIO"
        ) as Asset[];
        const regGroups = user.assets.filter(
            (asset) => asset.assetType === "REGULATION_GROUP"
        ) as Asset[];
        const regUnits = user.assets.filter(
            (asset) => asset.assetType === "REGULATION_UNIT"
        ) as Asset[];

        // Create a map of portfolioId -> groups for faster lookup
        const groupsByPortfolio = regGroups.reduce((acc, group) => {
            if (group.portfolioId) {
                if (!acc[group.portfolioId]) {
                    acc[group.portfolioId] = [];
                }
                acc[group.portfolioId].push(group);
            }
            return acc;
        }, {} as { [key: number]: Asset[] });

        // Create a map of groupId -> units for faster lookup
        const unitsByGroup = regUnits.reduce((acc, unit) => {
            if (unit.groupId) {
                if (!acc[unit.groupId]) {
                    acc[unit.groupId] = [];
                }
                acc[unit.groupId].push(unit);
            }
            return acc;
        }, {} as { [key: number]: Asset[] });

        // Build the tree structure
        return portfolios.map((portfolio) => ({
            id: `portfolio-${portfolio.id}`,
            name: portfolio.name,
            onClick: () => setSelectedAsset(portfolio),
            children:
                groupsByPortfolio[portfolio.id]?.map((group) => ({
                    id: `group-${group.id}`,
                    name: group.name,
                    onClick: () => setSelectedAsset(group),
                    children:
                        unitsByGroup[group.id]?.map((unit) => ({
                            id: `unit-${unit.id}`,
                            name: unit.name,
                            onClick: () => setSelectedAsset(unit),
                        })) || [],
                })) || [],
        }));
    };

    const renderAssetDetails = () => {
        if (!selectedAsset) return null;

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {selectedAsset.assetType}: {selectedAsset.name}
                    </h2>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAsset(selectedAsset.id, selectedAsset.assetType)}
                    >
                        Remove Asset
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Access Profiles</h3>
                        <div className="flex gap-2">
                            <select
                                className="h-8 rounded-md border border-input px-3"
                                value={
                                    selectedRoles[
                                        assetKeyString(selectedAsset.id, selectedAsset.assetType)
                                    ] || ""
                                }
                                onChange={(e) =>
                                    handleRoleChange(
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
                                onClick={() =>
                                    handleAddRole(selectedAsset.id, selectedAsset.assetType)
                                }
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    <ul className="space-y-2">
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
                                        handleRemoveRole(
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
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2">
                    <div className="font-bold text-xl text-gray-700">{user?.firstName}</div>
                    <div className="font-bold text-xl text-gray-700">{user?.lastName}</div>
                </div>
                <div className="text-gray-700">{user?.email}</div>
                {user?.company && <div className="text-gray-700">Company: {user.company.name}</div>}
            </div>

            <div className="flex gap-2">
                <select
                    value={newAsset.assetId === 0 ? "" : newAsset.assetId}
                    onChange={handleAssetChange}
                    className="h-10 rounded-md border border-input px-3"
                >
                    <option value="">Select Asset</option>
                    {portfolios.map((portfolio) => (
                        <option key={portfolio.id} value={portfolio.id}>
                            {portfolio.name} (Portfolio)
                        </option>
                    ))}
                    {regulationGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name} (Regulation Group)
                        </option>
                    ))}
                    {regulationUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.name} (Regulation Unit)
                        </option>
                    ))}
                </select>
                <select
                    value={newAsset.accessProfileId === 0 ? "" : newAsset.accessProfileId}
                    onChange={(e) =>
                        setNewAsset({ ...newAsset, accessProfileId: parseInt(e.target.value) })
                    }
                    className="h-10 rounded-md border border-input px-3"
                >
                    <option value="">Select Access Profile</option>
                    {accessProfiles.map((accessProfile) => (
                        <option key={accessProfile.id} value={accessProfile.id}>
                            {accessProfile.name}
                        </option>
                    ))}
                </select>
                <Button onClick={handleAddAsset}>Add Asset</Button>
            </div>

            <div className="flex gap-4">
                <div className="w-1/3 border rounded-lg">
                    <TreeView data={constructTreeData()} expandAll={true} className="p-2" />
                </div>
                <div className="w-2/3 border rounded-lg p-4">
                    {selectedAsset ? (
                        renderAssetDetails()
                    ) : (
                        <div className="text-center text-gray-500">
                            Select an asset to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
