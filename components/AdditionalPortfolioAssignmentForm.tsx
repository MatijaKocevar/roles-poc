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

export default function AdditionalPortfolioAssignmentForm({ userId }: { userId: number }) {
    const router = useRouter();
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedId, setSelectedId] = useState<number | "">("");
    const [permissions, setPermissions] = useState<PermissionType>({
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
    });

    useEffect(() => {
        async function fetchOptions() {
            const res = await fetch(`/api/available/portfolio?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setOptions(data);
            }
        }
        fetchOptions();
    }, [userId]);

    const handlePermissionToggle = (field: keyof PermissionType) => {
        setPermissions((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) {
            alert("Please select a portfolio.");
            return;
        }
        const res = await fetch("/api/assign-permission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                type: "portfolio",
                id: Number(selectedId),
                permissions,
            }),
        });
        if (res.ok) {
            router.refresh();
        } else {
            const data = await res.json();
            console.error("Portfolio assignment failed", data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
            <h3 className="text-xl font-bold">Assign Portfolio Permission</h3>
            <label className="block mb-1">Select Portfolio:</label>
            <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
                className="border rounded px-2 py-1 w-full"
                required
            >
                <option value="">-- Select Portfolio --</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
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
                Assign Portfolio Permission
            </button>
        </form>
    );
}
