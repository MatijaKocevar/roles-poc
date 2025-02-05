"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveUser } from "../../../../active-user-context";

export default function NewRolePage() {
    const [roleName, setRoleName] = useState("");
    const router = useRouter();
    const { hasPermission } = useActiveUser();

    if (!hasPermission("Role Management", "canView")) {
        router.push("/unauthorized");
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch("/api/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roleName }),
        });
        if (response.ok) {
            router.push("/security/roles");
        } else {
            console.error("Error creating role");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Create New Role</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-lg mb-2">Role Name</label>
                    <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create Role
                </button>
            </form>
        </div>
    );
}
