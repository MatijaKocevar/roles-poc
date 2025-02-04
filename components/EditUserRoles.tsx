"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditUserRoles({ user, roles }: { user: any; roles: any[] }) {
    const initialRoleIds = user.roles.map((role: any) => role.id);
    const [selectedRoles, setSelectedRoles] = useState<number[]>(initialRoleIds);
    const router = useRouter();

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        const response = await fetch("/api/user-roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, roleIds: selectedRoles }),
        });
        if (response.ok) {
            router.push("/security/users");
        } else {
            console.error("Error updating user roles");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Edit User: {user.email}</h1>
            <div className="mb-4">
                <h2 className="text-xl mb-2">Assign Roles</h2>
                {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                        />
                        <span>{role.name}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Save Changes
            </button>
        </div>
    );
}
