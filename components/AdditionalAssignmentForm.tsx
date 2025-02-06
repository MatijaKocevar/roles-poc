"use client";

import { useEffect, useState } from "react";

type Option = {
    id: number;
    name: string;
};

type PermissionType = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
};

type AdditionalAssignmentFormProps = {
    userId: number;
    onAssignmentAdded: (
        type: "portfolio" | "group" | "unit",
        newAssignment: { id: number; assignedId: number; name: string; permissions: PermissionType }
    ) => void;
    refreshOptions: number;
    existingPortfolioIds: number[];
    existingGroupIds: number[];
    existingUnitIds: number[];
};

export default function AdditionalAssignmentForm({
    userId,
    onAssignmentAdded,
    refreshOptions,
    existingPortfolioIds,
    existingGroupIds,
    existingUnitIds,
}: AdditionalAssignmentFormProps) {
    const [availablePortfolios, setAvailablePortfolios] = useState<Option[]>([]);
    const [availableGroups, setAvailableGroups] = useState<Option[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Option[]>([]);

    const [selectedPortfolio, setSelectedPortfolio] = useState<number | "">("");
    const [selectedGroup, setSelectedGroup] = useState<number | "">("");
    const [selectedUnit, setSelectedUnit] = useState<number | "">("");

    const [permissions, setPermissions] = useState<PermissionType>({
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
    });

    // Always fetch all available options
    useEffect(() => {
        async function fetchPortfolios() {
            const res = await fetch(`/api/available/portfolio?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setAvailablePortfolios(data);
            }
        }
        fetchPortfolios();
    }, [userId, refreshOptions]);

    useEffect(() => {
        if (!selectedPortfolio) {
            setAvailableGroups([]);
            return;
        }
        async function fetchGroups() {
            const res = await fetch(
                `/api/available/group?userId=${userId}&portfolioId=${selectedPortfolio}`
            );
            if (res.ok) {
                const data = await res.json();
                setAvailableGroups(data);
            }
        }
        fetchGroups();
    }, [selectedPortfolio, userId, refreshOptions]);

    useEffect(() => {
        if (!selectedGroup) {
            setAvailableUnits([]);
            return;
        }
        async function fetchUnits() {
            const res = await fetch(
                `/api/available/unit?userId=${userId}&groupId=${selectedGroup}`
            );
            if (res.ok) {
                const data = await res.json();
                setAvailableUnits(data);
            }
        }
        fetchUnits();
    }, [selectedGroup, userId, refreshOptions]);

    const handlePermissionToggle = (field: keyof PermissionType) => {
        setPermissions((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let type: "unit" | "group" | "portfolio" | null = null;
        let id: number | null = null;

        if (selectedUnit) {
            type = "unit";
            id = Number(selectedUnit);
        } else if (selectedGroup) {
            type = "group";
            id = Number(selectedGroup);
        } else if (selectedPortfolio) {
            type = "portfolio";
            id = Number(selectedPortfolio);
        }

        if (!type || !id) {
            alert("Please select an option to assign.");
            return;
        }

        // Duplicate-check only for the type we intend to add.
        if (type === "portfolio" && existingPortfolioIds.includes(id)) {
            alert(
                "This portfolio is already assigned. If you want to add groups or units for this portfolio, please select a group or unit."
            );
            return; // Do not clear the form so user can choose a group/unit.
        }
        if (type === "group" && existingGroupIds.includes(id)) {
            alert("This group is already assigned.");
            return;
        }
        if (type === "unit" && existingUnitIds.includes(id)) {
            alert("This unit is already assigned.");
            return;
        }

        const res = await fetch("/api/assign-permission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                type,
                id,
                permissions,
            }),
        });

        if (res.ok) {
            const newAssignment = await res.json();
            const assignment = newAssignment.result;

            // Determine a display name.
            let name = "";
            if (type === "portfolio") {
                const found = availablePortfolios.find((p) => p.id === assignment.portfolioId);
                name = found ? found.name : `Portfolio ${assignment.portfolioId}`;
            } else if (type === "group") {
                const found = availableGroups.find((g) => g.id === assignment.groupId);
                name = found ? found.name : `Group ${assignment.groupId}`;
            } else if (type === "unit") {
                const found = availableUnits.find((u) => u.id === assignment.unitId);
                name = found ? found.name : `Unit ${assignment.unitId}`;
            }

            // Call parent's callback with the new assignment.
            onAssignmentAdded(type, {
                id: assignment.id, // assignment record id
                assignedId:
                    type === "portfolio"
                        ? assignment.portfolioId
                        : type === "group"
                        ? assignment.groupId
                        : assignment.unitId,
                name,
                permissions: {
                    canView: assignment.canView,
                    canEdit: assignment.canEdit,
                    canDelete: assignment.canDelete,
                    canCreate: assignment.canCreate,
                },
            });

            // Clear the form selections upon success.
            setSelectedPortfolio("");
            setSelectedGroup("");
            setSelectedUnit("");
            setAvailableGroups([]);
            setAvailableUnits([]);
            setPermissions({
                canView: false,
                canEdit: false,
                canDelete: false,
                canCreate: false,
            });
        } else {
            const data = await res.json();
            console.error("Assignment failed", data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
            <h2 className="text-xl font-bold mb-2">Add Additional Permission Assignment</h2>
            <div>
                <label className="block mb-1">Select Portfolio:</label>
                <select
                    value={selectedPortfolio}
                    onChange={(e) => {
                        setSelectedPortfolio(e.target.value ? Number(e.target.value) : "");
                        // When a new portfolio is selected, clear downstream selections.
                        setSelectedGroup("");
                        setAvailableGroups([]);
                        setSelectedUnit("");
                        setAvailableUnits([]);
                    }}
                    className="border rounded px-2 py-1 w-full"
                >
                    <option value="">-- Select Portfolio --</option>
                    {availablePortfolios.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedPortfolio && (
                <div>
                    <label className="block mb-1">Select Group:</label>
                    <select
                        value={selectedGroup}
                        onChange={(e) => {
                            setSelectedGroup(e.target.value ? Number(e.target.value) : "");
                            setSelectedUnit("");
                            setAvailableUnits([]);
                        }}
                        className="border rounded px-2 py-1 w-full"
                    >
                        <option value="">-- Select Group --</option>
                        {availableGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedGroup && (
                <div>
                    <label className="block mb-1">Select Unit:</label>
                    <select
                        value={selectedUnit}
                        onChange={(e) =>
                            setSelectedUnit(e.target.value ? Number(e.target.value) : "")
                        }
                        className="border rounded px-2 py-1 w-full"
                    >
                        <option value="">-- Select Unit --</option>
                        {availableUnits.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex space-x-4">
                {(["canView", "canEdit", "canDelete", "canCreate"] as (keyof PermissionType)[]).map(
                    (field) => (
                        <label key={field} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={permissions[field]}
                                onChange={() => handlePermissionToggle(field)}
                                className="mr-1"
                            />
                            <span className="capitalize">{field.replace("can", "")}</span>
                        </label>
                    )
                )}
            </div>

            <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Assign Permission
            </button>
        </form>
    );
}
