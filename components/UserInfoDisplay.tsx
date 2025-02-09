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
    getAllPortfolios,
    getAllRegulationGroups,
    getAllRegulationUnits,
    getAllRoles,
    getAssetTypeById,
} from "@/actions/user-assets";
import { Button } from "./ui/button";

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

export default function UserInfoDisplay({ user }: UserInfoDisplayProps) {
    const [newAsset, setNewAsset] = useState({
        assetId: 0,
        assetType: "",
        roleId: 0,
    });
    const [portfolios, setPortfolios] = useState<AssetOption[]>([]);
    const [regulationGroups, setRegulationGroups] = useState<AssetOption[]>([]);
    const [regulationUnits, setRegulationUnits] = useState<AssetOption[]>([]);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<{ [assetKey: string]: number }>({});

    function assetKeyString(assetId: number, assetType: string) {
        return `${assetType}-${assetId}`;
    }

    useEffect(() => {
        const fetchData = async () => {
            const portfoliosData = await getAllPortfolios();
            setPortfolios(portfoliosData);
            const regulationGroupsData = await getAllRegulationGroups();
            setRegulationGroups(regulationGroupsData);
            const regulationUnitsData = await getAllRegulationUnits();
            setRegulationUnits(regulationUnitsData);
            const rolesData = await getAllRoles();
            setRoles(rolesData);
        };

        fetchData();
    }, []);

    const handleAddAsset = async () => {
        if (user && newAsset.assetId && newAsset.assetType && newAsset.roleId) {
            await addAssetToUser(user.id, newAsset.assetId, newAsset.assetType);
            await addRoleToAsset(user.id, newAsset.roleId, newAsset.assetId, newAsset.assetType);
            setNewAsset({ assetId: 0, assetType: "", roleId: 0 });
        }
    };

    const handleRemoveAsset = async (assetId: number, assetType: string) => {
        if (user) {
            await removeAssetFromUser(user.id, assetId, assetType);
        }
    };

    const handleAddRole = async (assetId: number, assetType: string) => {
        if (user) {
            const currentKey = assetKeyString(assetId, assetType);
            const selectedRole = selectedRoles[currentKey];
            if (selectedRole) {
                await addRoleToAsset(user.id, selectedRole, assetId, assetType);
            }
        }
    };

    const handleRemoveRole = async (assetId: number, assetType: string, roleId: number) => {
        if (user) {
            await removeRoleFromAsset(user.id, roleId, assetId, assetType);
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

    function handleRoleChange(assetId: number, assetType: string, roleId: number) {
        setSelectedRoles((prev) => ({
            ...prev,
            [assetKeyString(assetId, assetType)]: roleId,
        }));
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2">
                    <div className="font-bold text-xl text-gray-700">{user?.firstName}</div>
                    <div className="font-bold text-xl text-gray-700">{user?.lastName}</div>
                </div>
                <div className="text-gray-700">{user?.email}</div>
                {/* New line for company name */}
                {user?.company && <div className="text-gray-700">Company: {user.company.name}</div>}
            </div>
            <div className="flex gap-2">
                {/* Add Asset Form */}
                <select
                    value={newAsset.assetId === 0 ? "" : newAsset.assetId}
                    onChange={handleAssetChange}
                >
                    <option value="">Select Asset</option>
                    {portfolios.map((portfolio) => (
                        // Key set here using portfolio.id
                        <option key={portfolio.id} value={portfolio.id}>
                            {portfolio.name} (Portfolio)
                        </option>
                    ))}
                    {regulationGroups.map((group) => (
                        // Key set here using group.id
                        <option key={group.id} value={group.id}>
                            {group.name} (Regulation Group)
                        </option>
                    ))}
                    {regulationUnits.map((unit) => (
                        // Key set here using unit.id
                        <option key={unit.id} value={unit.id}>
                            {unit.name} (Regulation Unit)
                        </option>
                    ))}
                </select>
                <select
                    value={newAsset.roleId === 0 ? "" : newAsset.roleId}
                    onChange={(e) => setNewAsset({ ...newAsset, roleId: parseInt(e.target.value) })}
                >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                        // Key set here using role.id
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                <Button onClick={handleAddAsset}>Add Asset</Button>
            </div>

            <div className="space-y-4">
                {user?.assets.map((asset, idx) => {
                    // Create a guaranteed unique key for the asset
                    const assetKey = `${asset.assetType}-${asset.id ?? "unknown"}-${idx}`;
                    return (
                        <div
                            key={assetKey}
                            className="border border-gray-300 rounded-md p-4 shadow-sm"
                        >
                            <div className="font-semibold text-lg mb-2 flex flex-col justify-between">
                                <div className="flex flex-row gap-2 items-center justify-between">
                                    <div className="flex flex-row gap-2 items-center">
                                        <div>
                                            {asset.assetType}: {asset.name}
                                        </div>
                                    </div>
                                    <Button
                                        variant={"destructive"}
                                        onClick={() =>
                                            handleRemoveAsset(asset.id || 0, asset.assetType)
                                        }
                                    >
                                        Remove Asset
                                    </Button>
                                </div>
                                <div className="flex flex-row items-center gap-10">
                                    <span className="font-semibold">Roles:</span>
                                    <div className="flex gap-2">
                                        {/* Add/Remove Role Form */}
                                        <select
                                            className="font-normal"
                                            value={
                                                selectedRoles[
                                                    assetKeyString(asset.id || 0, asset.assetType)
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    asset.id || 0,
                                                    asset.assetType,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                // Key set here using role.id
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            onClick={() =>
                                                handleAddRole(asset.id || 0, asset.assetType)
                                            }
                                        >
                                            Add Role
                                        </Button>
                                    </div>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {asset.roles.map((role, roleIdx) => {
                                        // Create a composite key for the role
                                        const compositeKey = `${assetKey}-role-${
                                            role.id ?? "unknown"
                                        }-${roleIdx}`;
                                        const tooltipId = `role-tooltip-${compositeKey}`;
                                        return (
                                            <li
                                                key={compositeKey}
                                                className="mb-2 flex justify-between items-center"
                                            >
                                                <div className="flex items-center">
                                                    <span
                                                        data-tooltip-id={tooltipId}
                                                        className="font-medium text-indigo-600 cursor-pointer"
                                                    >
                                                        {role.name}
                                                    </span>
                                                </div>
                                                <Tooltip
                                                    id={tooltipId}
                                                    className="max-w-md"
                                                    style={{
                                                        width: "fit-content",
                                                        height: "fit-content",
                                                    }}
                                                    place="right"
                                                >
                                                    {role.permissions?.map((perm) => (
                                                        // Key set here using compositeKey and perm.id
                                                        <div
                                                            className="z-50"
                                                            key={`perm-${compositeKey}-${perm.id}`}
                                                        >
                                                            {`${perm.module.name}: ${perm.permission}`}
                                                        </div>
                                                    ))}
                                                </Tooltip>
                                                <Button
                                                    variant={"destructive"}
                                                    onClick={() =>
                                                        handleRemoveRole(
                                                            asset.id || 0,
                                                            asset.assetType,
                                                            role.id
                                                        )
                                                    }
                                                >
                                                    Remove Role
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
