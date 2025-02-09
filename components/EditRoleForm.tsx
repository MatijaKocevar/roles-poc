"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getModulesTree } from "@/actions/modules";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import React from "react";
import { getPermissionsForRole, getRole, updateRole } from "../actions/roles";
import { Button } from "./ui/button";

interface EditRoleFormProps {
    roleId: string;
}

export default function EditRoleForm({ roleId }: EditRoleFormProps) {
    const [name, setName] = useState("");
    const [availableModules, setAvailableModules] = useState<
        Array<{ id: number; title: string; submodules: Array<{ id: number; title: string }> }>
    >([]);
    // selectedModules initialized from permissions assignment.
    const [selectedModules, setSelectedModules] = useState<
        Array<{ id: number; title: string; submodules: Array<{ id: number; title: string }> }>
    >([]);
    const [permissions, setPermissions] = useState<{ [moduleId: number]: "VIEW" | "MANAGE" }>({});
    const router = useRouter();

    const fetchRoleName = useCallback(async () => {
        const data = await getRole(roleId);
        setName(data?.name || "");
    }, [roleId]);

    useEffect(() => {
        async function fetchData() {
            const tree = await getModulesTree();
            setAvailableModules(tree);
            const perms = await getPermissionsForRole(roleId);
            setPermissions(perms);
            // Initialize selectedModules only with modules that have an entry in perms.
            const selected = tree
                .filter((m) => perms[m.id] !== undefined)
                .map((m) => ({
                    id: m.id,
                    title: m.title,
                    submodules: m.submodules.filter((s) => perms[s.id] !== undefined),
                }));
            setSelectedModules(selected);
        }
        fetchRoleName();
        fetchData();
    }, [roleId, fetchRoleName]);

    const handlePermissionChange = (moduleId: number, newPermission: "VIEW" | "MANAGE") => {
        setPermissions((prev) => ({
            ...prev,
            [moduleId]: newPermission,
        }));
    };

    const handleAddModule = (id: number) => {
        const moduleToAdd = availableModules.find((m) => m.id === id);
        if (moduleToAdd && !selectedModules.find((m) => m.id === id)) {
            setSelectedModules((prev) => [...prev, moduleToAdd]);
            setPermissions((prev) => ({
                ...prev,
                [id]: "VIEW",
            }));
        }
    };

    const handleRemoveModule = (id: number, isSubmodule = false, parentId?: number) => {
        if (isSubmodule && parentId) {
            setSelectedModules((prev) =>
                prev.map((m) =>
                    m.id === parentId
                        ? { ...m, submodules: m.submodules.filter((sub) => sub.id !== id) }
                        : m
                )
            );
        } else {
            setSelectedModules((prev) => prev.filter((m) => m.id !== id));
        }
        setPermissions((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    async function handleSubmit(event: any) {
        event.preventDefault();
        await updateRole(roleId, name, permissions);

        router.push("/management/roles");
    }

    const moduleOptions = availableModules.filter(
        (m) => !selectedModules.find((sm) => sm.id === m.id)
    );

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            {/* Role Name Section */}
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                    Role Name:
                </label>
                <input
                    type="text"
                    id="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            {/* Selected Modules Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Module</TableHead>
                        <TableHead className="text-center">Permission</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedModules.map((module) => (
                        <React.Fragment key={module.id}>
                            <TableRow>
                                <TableCell>{module.title}</TableCell>
                                <TableCell className="text-center">
                                    <select
                                        value={permissions[module.id] || "VIEW"}
                                        onChange={(e) =>
                                            handlePermissionChange(
                                                module.id,
                                                e.target.value as "VIEW" | "MANAGE"
                                            )
                                        }
                                    >
                                        <option value="VIEW">VIEW</option>
                                        <option value="MANAGE">MANAGE</option>
                                    </select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveModule(module.id)}
                                    >
                                        Remove
                                    </button>
                                </TableCell>
                            </TableRow>
                            {module.submodules.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="pl-8">{sub.title}</TableCell>
                                    <TableCell className="text-center">
                                        <select
                                            value={permissions[sub.id] || "VIEW"}
                                            onChange={(e) =>
                                                handlePermissionChange(
                                                    sub.id,
                                                    e.target.value as "VIEW" | "MANAGE"
                                                )
                                            }
                                        >
                                            <option value="VIEW">VIEW</option>
                                            <option value="MANAGE">MANAGE</option>
                                        </select>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveModule(sub.id, true, module.id)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Add Submodule dropdown for this module */}
                            <TableRow>
                                <TableCell colSpan={3} className="pl-8">
                                    <select
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const subId = Number(e.target.value);
                                                const mod = availableModules.find(
                                                    (m) => m.id === module.id
                                                );
                                                if (mod) {
                                                    const subToAdd = mod.submodules.find(
                                                        (s) => s.id === subId
                                                    );
                                                    if (
                                                        subToAdd &&
                                                        !module.submodules.find(
                                                            (s) => s.id === subId
                                                        )
                                                    ) {
                                                        setSelectedModules((prev) =>
                                                            prev.map((m) =>
                                                                m.id === module.id
                                                                    ? {
                                                                          ...m,
                                                                          submodules: [
                                                                              ...m.submodules,
                                                                              subToAdd,
                                                                          ],
                                                                      }
                                                                    : m
                                                            )
                                                        );
                                                        setPermissions((prev) => ({
                                                            ...prev,
                                                            [subId]: "VIEW",
                                                        }));
                                                    }
                                                }
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="">Add Submodule</option>
                                        {availableModules
                                            .find((m) => m.id === module.id)
                                            ?.submodules.filter(
                                                (s) =>
                                                    !module.submodules.find((ss) => ss.id === s.id)
                                            )
                                            .map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.title}
                                                </option>
                                            ))}
                                    </select>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
            {/* Add Module dropdown */}
            <div className="mt-4">
                <select
                    defaultValue=""
                    onChange={(e) => {
                        if (e.target.value) {
                            handleAddModule(Number(e.target.value));
                            e.target.value = "";
                        }
                    }}
                >
                    <option value="">Add Module</option>
                    {moduleOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center justify-between mt-4">
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Update Role
                </Button>
            </div>
        </form>
    );
}
