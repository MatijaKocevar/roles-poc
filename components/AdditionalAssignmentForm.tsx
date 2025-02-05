"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AdditionalAssignmentForm({ userId }: { userId: number }) {
    const router = useRouter();

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

    useEffect(() => {
        async function fetchPortfolios() {
            const res = await fetch(`/api/available/portfolio?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setAvailablePortfolios(data);
            }
        }
        fetchPortfolios();
    }, [userId]);

    useEffect(() => {
        if (!selectedPortfolio) return;
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
    }, [selectedPortfolio, userId]);

    useEffect(() => {
        if (!selectedGroup) return;
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
    }, [selectedGroup, userId]);

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
            router.refresh();
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
