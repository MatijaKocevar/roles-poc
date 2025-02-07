"use client";
import { useState } from "react";
import { useActiveUser } from "../app/active-user-context";

type PermissionField = "canView" | "canEdit" | "canDelete" | "canCreate";

export default function EditRolePrivileges({ role, modules }: { role: any; modules: any[] }) {
    const { user, setUser } = useActiveUser();

    const initialPermissions: {
        [key: number]: {
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canCreate: boolean;
        };
    } = {};
    role.permissions.forEach((perm: any) => {
        initialPermissions[perm.module.id] = {
            canView: perm.canView,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canCreate: perm.canCreate,
        };
    });
    const [permissions, setPermissions] = useState(initialPermissions);
    const togglePermission = (moduleId: number, field: PermissionField) => {
        setPermissions((prev) => ({
            ...prev,
            [moduleId]: { ...prev[moduleId], [field]: !prev[moduleId]?.[field] },
        }));
    };
    const handleSave = async () => {
        await fetch("/api/role-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId: role.id, permissions }),
        });

        if (user?.roles.some((r) => r.id === role.id)) {
            {
                const res = await fetch(`/api/user?id=${user.id}`);

                if (res.ok) {
                    const newUser = await res.json();
                    setUser(newUser);
                }
            }
        }
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
            {modules.map((module) => (
                <div key={module.id} className="mb-4 border rounded p-4">
                    <h2 className="text-xl font-semibold">{module.name}</h2>
                    <div className="flex space-x-4 mb-4">
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[module.id]?.canView ?? false}
                                onChange={() => togglePermission(module.id, "canView")}
                            />
                            <span className="ml-1">View</span>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[module.id]?.canEdit ?? false}
                                onChange={() => togglePermission(module.id, "canEdit")}
                            />
                            <span className="ml-1">Edit</span>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[module.id]?.canDelete ?? false}
                                onChange={() => togglePermission(module.id, "canDelete")}
                            />
                            <span className="ml-1">Delete</span>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={permissions[module.id]?.canCreate ?? false}
                                onChange={() => togglePermission(module.id, "canCreate")}
                            />
                            <span className="ml-1">Create</span>
                        </label>
                    </div>
                    {module.submodules.length > 0 && (
                        <div className="ml-4">
                            {module.submodules.map((sub: any) => (
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
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[sub.id]?.canCreate ?? false}
                                                onChange={() =>
                                                    togglePermission(sub.id, "canCreate")
                                                }
                                            />
                                            <span className="ml-1">Create</span>
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
