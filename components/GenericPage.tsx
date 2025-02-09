"use client";
import { useActiveUser } from "@/app/active-user-context";
import { PermissionType } from "@prisma/client";

interface GenericPageProps {
    pageName: string;
    moduleId: number;
}

export default function GenericPage({ pageName, moduleId }: GenericPageProps) {
    const { hasPermission } = useActiveUser();

    const canView = hasPermission(moduleId, PermissionType.VIEW);
    const canManage = hasPermission(moduleId, PermissionType.MANAGE);

    const getButtonClass = (hasPermission: boolean) =>
        hasPermission
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-700 cursor-not-allowed";

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{pageName}</h1>
            <div className="flex space-x-4">
                <button
                    disabled={!canView}
                    className={`px-4 py-2 rounded ${getButtonClass(canView)}`}
                >
                    View
                </button>
                <button
                    disabled={!canManage}
                    className={`px-4 py-2 rounded ${getButtonClass(canManage)}`}
                >
                    Manage
                </button>
            </div>
        </div>
    );
}
