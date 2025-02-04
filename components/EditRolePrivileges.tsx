"use client";
import { useState } from "react";
export default function EditRolePrivileges({ role, pages }: { role: any; pages: any[] }) {
    const initialPermissions: {
        [key: number]: { canView: boolean; canEdit: boolean; canDelete: boolean };
    } = {};
    role.permissions.forEach((perm: any) => {
        initialPermissions[perm.page.id] = {
            canView: perm.canView,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
        };
    });
    const [permissions, setPermissions] = useState(initialPermissions);
    const togglePermission = (pageId: number, field: "canView" | "canEdit" | "canDelete") => {
        setPermissions((prev) => ({
            ...prev,
            [pageId]: { ...prev[pageId], [field]: !prev[pageId]?.[field] },
        }));
    };
    const handleSave = async () => {
        const response = await fetch("/api/role-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId: role.id, permissions }),
        });
        const data = await response.json();
        console.log("Saved", data);
    };
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-6">Edit Role: {role.name}</h1>
                <button
                    onClick={handleSave}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </div>
            {pages.map((page) => (
                <div key={page.id} className="mb-4 border rounded p-4">
                    <h2 className="text-xl font-semibold">{page.name}</h2>
                    <div className="flex space-x-4 mb-4">
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[page.id]?.canView ?? false}
                                onChange={() => togglePermission(page.id, "canView")}
                            />
                            <span className="ml-1">View</span>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[page.id]?.canEdit ?? false}
                                onChange={() => togglePermission(page.id, "canEdit")}
                            />
                            <span className="ml-1">Edit</span>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[page.id]?.canDelete ?? false}
                                onChange={() => togglePermission(page.id, "canDelete")}
                            />
                            <span className="ml-1">Delete</span>
                        </label>
                    </div>
                    {page.subpages.length > 0 && (
                        <div className="ml-4">
                            {page.subpages.map((sub: any) => (
                                <div key={sub.id} className="mb-2">
                                    <h3 className="text-lg">{sub.name}</h3>
                                    <div className="flex space-x-4">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[sub.id]?.canView ?? false}
                                                onChange={() => togglePermission(sub.id, "canView")}
                                            />
                                            <span className="ml-1">View</span>
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[sub.id]?.canEdit ?? false}
                                                onChange={() => togglePermission(sub.id, "canEdit")}
                                            />
                                            <span className="ml-1">Edit</span>
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[sub.id]?.canDelete ?? false}
                                                onChange={() =>
                                                    togglePermission(sub.id, "canDelete")
                                                }
                                            />
                                            <span className="ml-1">Delete</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
