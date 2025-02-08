"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { User } from "../../active-user-context";
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
} from "@/actions/user-actions";

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
    const [selectedRoles, setSelectedRoles] = useState<{ [assetId: number]: number }>({});

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
            await addRoleToAsset(newAsset.roleId, newAsset.assetId, newAsset.assetType);
            setNewAsset({ assetId: 0, assetType: "", roleId: 0 });
        }
    };

    const handleRemoveAsset = async (assetId: number, assetType: string) => {
        if (user) {
            await removeAssetFromUser(user.id, assetId, assetType);
        }
    };

    const handleAddRole = async (assetId: number, assetType: string) => {
        const selectedRole = selectedRoles[assetId];
        if (selectedRole) {
            await addRoleToAsset(selectedRole, assetId, assetType);
        }
    };

    const handleRemoveRole = async (assetId: number, assetType: string, roleId: number) => {
        await removeRoleFromAsset(roleId, assetId, assetType);
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

    const handleRoleChange = (assetId: number, roleId: number) => {
        setSelectedRoles((prev) => ({ ...prev, [assetId]: roleId }));
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-row gap-4">
                <div className="flex flex-row gap-1">
                    <div className="font-bold text-xl mb-2 text-gray-700">{user?.firstName}</div>
                    <div className="font-bold text-xl mb-2 text-gray-700">{user?.lastName}</div>
                </div>
                <div className="font-bold text-xl mb-2 text-gray-700">{user?.email}</div>
            </div>
            <div className="flex gap-2">
                {/* Add Asset Form */}
                <select
                    value={newAsset.assetId === 0 ? "" : newAsset.assetId}
                    onChange={handleAssetChange}
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
                    value={newAsset.roleId === 0 ? "" : newAsset.roleId}
                    onChange={(e) => setNewAsset({ ...newAsset, roleId: parseInt(e.target.value) })}
                >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddAsset}>Add Asset</button>
            </div>
            <div className="space-y-4">
                {user?.assets.map((asset) => (
                    <div key={asset.id} className="border border-gray-300 rounded-md p-4 shadow-sm">
                        <div className="font-semibold text-lg mb-2">
                            {asset.assetType}: {asset.name}
                        </div>
                        <div>
                            <span className="font-semibold">Roles:</span>
                            <ul className="mt-2 space-y-1">
                                {asset.roles.map((role) => {
                                    const tooltipId = `role-tooltip-${role.id}`;
                                    return (
                                        <li key={role.id} className="mb-2 flex gap-2">
                                            <span
                                                data-tooltip-id={tooltipId}
                                                className="font-medium text-indigo-600 cursor-pointer"
                                            >
                                                {role.name}
                                            </span>
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
                                                    <div className="z-50" key={perm.id}>
                                                        {`${perm.module.name}: (View: ${
                                                            perm.canView ? "✔" : "✘"
                                                        }, Edit: ${
                                                            perm.canEdit ? "✔" : "✘"
                                                        }, Delete: ${
                                                            perm.canDelete ? "✔" : "✘"
                                                        }, Create: ${perm.canCreate ? "✔" : "✘"})`}
                                                    </div>
                                                ))}
                                            </Tooltip>
                                            <button
                                                onClick={() =>
                                                    handleRemoveRole(
                                                        asset.id || 0,
                                                        asset.assetType,
                                                        role.id
                                                    )
                                                }
                                            >
                                                Remove Role
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <button onClick={() => handleRemoveAsset(asset.id || 0, asset.assetType)}>
                            Remove Asset
                        </button>
                        <div className="flex gap-2">
                            {/* Add/Remove Role Form */}
                            <select
                                value={selectedRoles[asset.id || 0] || ""}
                                onChange={(e) =>
                                    handleRoleChange(asset.id || 0, parseInt(e.target.value))
                                }
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => handleAddRole(asset.id || 0, asset.assetType)}>
                                Add Role
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
