"use client";
import { useActiveUser } from "@/app/active-user-context";

type PermissionKey = "canCreate" | "canEdit" | "canDelete";

export default function GenericPage({ pageName }: { pageName: string }) {
    const { hasPermission } = useActiveUser();

    const getButtonClass = (permKey: PermissionKey) =>
        hasPermission(pageName, permKey)
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-700 cursor-not-allowed";

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{pageName.toUpperCase()}</h1>
            <div className="flex space-x-4">
                <button
                    disabled={!hasPermission(pageName, "canCreate")}
                    className={`px-4 py-2 rounded ${getButtonClass("canCreate")}`}
                >
                    Create
                </button>
                <button
                    disabled={!hasPermission(pageName, "canEdit")}
                    className={`px-4 py-2 rounded ${getButtonClass("canEdit")}`}
                >
                    Edit
                </button>
                <button
                    disabled={!hasPermission(pageName, "canDelete")}
                    className={`px-4 py-2 rounded ${getButtonClass("canDelete")}`}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
