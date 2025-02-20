"use client";

import { useState, useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { User } from "../app/active-user-context";
import {
    addAssetToUser,
    removeAssetFromUser,
    addRoleToAsset,
    removeRoleFromAsset,
    getAllRoles,
    getAvailableAssetsByCompany,
} from "@/actions/asset";
import { AssetType } from "@prisma/client";
import { TreeDataItem, TreeView } from "./ui/tree-view";
import { useRouter } from "next/navigation";

import { UserHeader } from "./user/UserHeader";
import { AssetSelector } from "./user/AssetSelector";
import { AssetDetails } from "./user/AssetDetails";
import { getUserById } from "../actions/user";

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
    portfolioId?: number;
    groupId?: number;
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

    function assetKeyString(assetId: number, assetType: AssetType) {
        return `${assetType}-${assetId}`;
    }

    useEffect(() => {
        const fetchData = async () => {
            const { portfolios, regulationGroups, regulationUnits } =
                await getAvailableAssetsByCompany();

            setPortfolios(portfolios);
            setRegulationGroups(regulationGroups);
            setRegulationUnits(regulationUnits);

            const accessProfilesData = await getAllRoles();
            setRoles(accessProfilesData);
        };

        fetchData();
    }, []);

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
                const newProfile = accessProfiles.find((profile) => profile.id === selectedRole);
                if (selectedAsset && newProfile) {
                    setSelectedAsset({
                        ...selectedAsset,
                        accessProfiles: [...selectedAsset.accessProfiles, newProfile],
                    });
                }

                await addRoleToAsset(user.id, selectedRole, assetId, assetType);
                setSelectedRoles((prev) => ({ ...prev, [currentKey]: 0 }));

                const userData = await getUserById(user.id);
                if (userData?.user.assets) {
                    const freshAsset = userData.user.assets.find(
                        (asset) => asset.id === assetId && asset.assetType === assetType
                    );
                    if (freshAsset) {
                        setSelectedAsset(freshAsset as SelectedAsset);
                    }
                }

                router.refresh();
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

    const handleAssetChange = (assetId: number, assetType: AssetType) => {
        setNewAsset((prev) => ({
            ...prev,
            assetId,
            assetType,
        }));
    };

    function handleRoleChange(assetId: number, assetType: AssetType, accessProfileId: number) {
        setSelectedRoles((prev) => ({
            ...prev,
            [assetKeyString(assetId, assetType)]: accessProfileId,
        }));
    }

    const constructTreeData = (): TreeDataItem[] => {
        if (!user?.assets) return [];

        const treeData: TreeDataItem[] = [];

        const portfolios = user.assets.filter(
            (asset) => asset.assetType === "PORTFOLIO"
        ) as Asset[];
        const regGroups = user.assets.filter(
            (asset) => asset.assetType === "REGULATION_GROUP"
        ) as Asset[];
        const regUnits = user.assets.filter(
            (asset) => asset.assetType === "REGULATION_UNIT"
        ) as Asset[];

        portfolios.forEach((portfolio) => {
            const portfolioNode: TreeDataItem = {
                id: `portfolio-${portfolio.id}`,
                name: portfolio.name,
                onClick: () => setSelectedAsset(portfolio as SelectedAsset),
                children: [],
            };

            const portfolioGroups = regGroups.filter((group) => group.portfolioId === portfolio.id);
            portfolioGroups.forEach((group) => {
                const groupNode: TreeDataItem = {
                    id: `group-${group.id}`,
                    name: group.name,
                    onClick: () => setSelectedAsset(group as SelectedAsset),
                    children: [],
                };

                const groupUnits = regUnits.filter((unit) => unit.groupId === group.id);
                groupUnits.forEach((unit) => {
                    groupNode.children?.push({
                        id: `unit-${unit.id}`,
                        name: unit.name,
                        onClick: () => setSelectedAsset(unit as SelectedAsset),
                    });
                });

                portfolioNode.children?.push(groupNode);
            });

            treeData.push(portfolioNode);
        });

        const standaloneGroups = regGroups.filter(
            (group) => !portfolios.some((portfolio) => portfolio.id === group.portfolioId)
        );

        standaloneGroups.forEach((group) => {
            const groupNode: TreeDataItem = {
                id: `group-${group.id}`,
                name: group.name,
                onClick: () => setSelectedAsset(group as SelectedAsset),
                children: [],
            };

            const groupUnits = regUnits.filter((unit) => unit.groupId === group.id);
            groupUnits.forEach((unit) => {
                groupNode.children?.push({
                    id: `unit-${unit.id}`,
                    name: unit.name,
                    onClick: () => setSelectedAsset(unit as SelectedAsset),
                });
            });

            treeData.push(groupNode);
        });

        const standaloneUnits = regUnits.filter(
            (unit) => !regGroups.some((group) => group.id === unit.groupId)
        );

        standaloneUnits.forEach((unit) => {
            treeData.push({
                id: `unit-${unit.id}`,
                name: unit.name,
                onClick: () => setSelectedAsset(unit as SelectedAsset),
            });
        });

        return treeData;
    };

    return (
        <div className="p-4 space-y-4">
            <UserHeader
                firstName={user?.firstName || ""}
                lastName={user?.lastName || ""}
                email={user?.email || ""}
                companyName={user?.company?.name}
            />

            <AssetSelector
                newAsset={newAsset}
                portfolios={portfolios}
                regulationGroups={regulationGroups}
                regulationUnits={regulationUnits}
                accessProfiles={accessProfiles}
                onAssetChange={handleAssetChange}
                onAccessProfileChange={(id) => setNewAsset({ ...newAsset, accessProfileId: id })}
                onAddAsset={handleAddAsset}
            />

            <div className="flex gap-4">
                <div className="w-1/3 border rounded-lg">
                    <TreeView data={constructTreeData()} expandAll={true} className="p-2" />
                </div>
                <div className="w-2/3 border rounded-lg p-4">
                    {selectedAsset ? (
                        <AssetDetails
                            selectedAsset={selectedAsset}
                            onRemoveAsset={handleRemoveAsset}
                            onAddRole={handleAddRole}
                            onRemoveRole={handleRemoveRole}
                            onRoleChange={handleRoleChange}
                            selectedRoles={selectedRoles}
                            accessProfiles={accessProfiles}
                            assetKeyString={assetKeyString}
                        />
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
