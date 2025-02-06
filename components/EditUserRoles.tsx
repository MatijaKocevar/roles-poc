"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveUser } from "../app/active-user-context";
import AdditionalAssignmentForm from "@/components/AdditionalAssignmentForm";

type PermissionType = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
};

type EditableAssignment = {
    id: number;
    name: string;
    permissions: PermissionType;
};

type EditUserRolesProps = {
    user: any;
    roles: any[];
};

export default function EditUserRoles({ user, roles }: EditUserRolesProps) {
    const initialRoleIds = user.roles.map((r: any) => r.id);
    const [selectedRoles, setSelectedRoles] = useState<number[]>(initialRoleIds);
    const router = useRouter();
    const { user: activeUser, setUser } = useActiveUser();

    const [portfolioAssignments, setPortfolioAssignments] = useState<EditableAssignment[]>(
        user.userPortfolioPermissions.map((assignment: any) => ({
            id: assignment.id,
            name: assignment.portfolio.name,
            permissions: {
                canView: assignment.canView,
                canEdit: assignment.canEdit,
                canDelete: assignment.canDelete,
                canCreate: assignment.canCreate,
            },
        }))
    );

    const [groupAssignments, setGroupAssignments] = useState<EditableAssignment[]>(
        user.userGroupPermissions.map((assignment: any) => ({
            id: assignment.id,
            name: assignment.group.name,
            permissions: {
                canView: assignment.canView,
                canEdit: assignment.canEdit,
                canDelete: assignment.canDelete,
                canCreate: assignment.canCreate,
            },
        }))
    );

    const [unitAssignments, setUnitAssignments] = useState<EditableAssignment[]>(
        user.userUnitPermissions.map((assignment: any) => ({
            id: assignment.id,
            name: assignment.unit.name,
            permissions: {
                canView: assignment.canView,
                canEdit: assignment.canEdit,
                canDelete: assignment.canDelete,
                canCreate: assignment.canCreate,
            },
        }))
    );

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    };

    const handlePermissionChange = (
        assignments: EditableAssignment[],
        setAssignments: React.Dispatch<React.SetStateAction<EditableAssignment[]>>,
        id: number,
        field: keyof PermissionType
    ) => {
        setAssignments(
            assignments.map((assignment) =>
                assignment.id === id
                    ? {
                          ...assignment,
                          permissions: {
                              ...assignment.permissions,
                              [field]: !assignment.permissions[field],
                          },
                      }
                    : assignment
            )
        );
    };

    // Delete handlers for each permission type
    const handleDeletePortfolio = async (id: number) => {
        const res = await fetch("/api/user-portfolio-permissions/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.success) {
            setPortfolioAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
        } else {
            console.error("Error deleting portfolio permission", data.error);
        }
    };

    const handleDeleteGroup = async (id: number) => {
        const res = await fetch("/api/user-group-permissions/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.success) {
            setGroupAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
        } else {
            console.error("Error deleting group permission", data.error);
        }
    };

    const handleDeleteUnit = async (id: number) => {
        const res = await fetch("/api/user-unit-permissions/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.success) {
            setUnitAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
        } else {
            console.error("Error deleting unit permission", data.error);
        }
    };

    const handleSave = async () => {
        const response = await fetch("/api/user-roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, roleIds: selectedRoles }),
        });

        const portfolioResponse = await fetch("/api/user-portfolio-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, assignments: portfolioAssignments }),
        });

        const groupResponse = await fetch("/api/user-group-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, assignments: groupAssignments }),
        });

        const unitResponse = await fetch("/api/user-unit-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, assignments: unitAssignments }),
        });

        if (activeUser?.id === user.id) {
            const res = await fetch(`/api/user?id=${user.id}`);
            if (res.ok) {
                const newUser = await res.json();
                setUser(newUser);
            }
        }

        if (response.ok && portfolioResponse.ok && groupResponse.ok && unitResponse.ok) {
            router.push("/security/users");
        } else {
            console.error("Error updating user roles or permissions");
        }
    };

    // Check if the current user is a Super_Admin
    const isSuperAdmin = activeUser?.roles?.some((r: any) => r.name === "Super_Admin");

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-3xl font-bold">Edit User: {user.email}</h1>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </div>

            {/* Global Roles */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Global Roles</h2>
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

            <div className="flex flex-row justify-between ">
                {/* Portfolio Permissions */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Portfolio Permissions</h2>
                    {portfolioAssignments.length > 0 ? (
                        portfolioAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="flex flex-col border p-2 rounded mb-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold">
                                        Portfolio: {assignment.name}
                                    </div>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() => handleDeletePortfolio(assignment.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    {(
                                        [
                                            "canView",
                                            "canEdit",
                                            "canDelete",
                                            "canCreate",
                                        ] as (keyof PermissionType)[]
                                    ).map((field) => (
                                        <label key={field} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={assignment.permissions[field]}
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        portfolioAssignments,
                                                        setPortfolioAssignments,
                                                        assignment.id,
                                                        field
                                                    )
                                                }
                                                className="mr-1"
                                            />
                                            <span className="capitalize">
                                                {field.replace("can", "")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No portfolio-specific permissions assigned.</p>
                    )}
                </div>

                {/* Group Permissions */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Group Permissions</h2>
                    {groupAssignments.length > 0 ? (
                        groupAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="flex flex-col border p-2 rounded mb-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold">Group: {assignment.name}</div>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() => handleDeleteGroup(assignment.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    {(
                                        [
                                            "canView",
                                            "canEdit",
                                            "canDelete",
                                            "canCreate",
                                        ] as (keyof PermissionType)[]
                                    ).map((field) => (
                                        <label key={field} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={assignment.permissions[field]}
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        groupAssignments,
                                                        setGroupAssignments,
                                                        assignment.id,
                                                        field
                                                    )
                                                }
                                                className="mr-1"
                                            />
                                            <span className="capitalize">
                                                {field.replace("can", "")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No group-specific permissions assigned.</p>
                    )}
                </div>

                {/* Unit Permissions */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Unit Permissions</h2>
                    {unitAssignments.length > 0 ? (
                        unitAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="flex flex-col border p-2 rounded mb-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold">Unit: {assignment.name}</div>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() => handleDeleteUnit(assignment.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    {(
                                        [
                                            "canView",
                                            "canEdit",
                                            "canDelete",
                                            "canCreate",
                                        ] as (keyof PermissionType)[]
                                    ).map((field) => (
                                        <label key={field} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={assignment.permissions[field]}
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        unitAssignments,
                                                        setUnitAssignments,
                                                        assignment.id,
                                                        field
                                                    )
                                                }
                                                className="mr-1"
                                            />
                                            <span className="capitalize">
                                                {field.replace("can", "")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No unit-specific permissions assigned.</p>
                    )}
                </div>
            </div>

            {/* Additional Assignment Form for Super_Admin */}
            {isSuperAdmin && (
                <div className="mt-8">
                    <AdditionalAssignmentForm userId={user.id} />
                </div>
            )}
        </div>
    );
}
