"use client";

import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { User } from "../../active-user-context";

interface UserInfoDisplayProps {
    user: User | undefined;
}

export default function UserInfoDisplay({ user }: UserInfoDisplayProps) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-row gap-4">
                <div className="flex flex-row gap-1">
                    <div className="font-bold text-xl mb-2 text-gray-700">{user?.firstName}</div>
                    <div className="font-bold text-xl mb-2 text-gray-700">{user?.lastName}</div>
                </div>
                <div className="font-bold text-xl mb-2 text-gray-700">{user?.email}</div>
            </div>
            <div className="space-y-4">
                {user?.assets.map((asset) => (
                    <div key={asset.id} className="border border-gray-300 rounded-md p-4 shadow-sm">
                        <div className="font-semibold text-lg mb-2">
                            {asset.assetType}: {asset.name}
                        </div>
                        <div>
                            <span className="font-semibold">Roles:</span>
                            <ul className="mt-2 space-y-1">
                                {asset.roles.map((role) => {
                                    const tooltipId = `role-tooltip-${role.id}`;
                                    return (
                                        <li key={role.id} className="mb-2">
                                            <span
                                                data-tooltip-id={tooltipId}
                                                className="font-medium text-indigo-600 cursor-pointer"
                                            >
                                                {role.name}
                                            </span>
                                            <Tooltip
                                                id={tooltipId}
                                                className="max-w-md"
                                                style={{
                                                    width: "fit-content",
                                                    height: "fit-content",
                                                }}
                                                place="right"
                                            >
                                                {role.permissions?.map((perm) => (
                                                    <div className="z-50" key={perm.id}>
                                                        {`${perm.module.name}: (View: ${
                                                            perm.canView ? "✔" : "✘"
                                                        }, Edit: ${
                                                            perm.canEdit ? "✔" : "✘"
                                                        }, Delete: ${
                                                            perm.canDelete ? "✔" : "✘"
                                                        }, Create: ${perm.canCreate ? "✔" : "✘"})`}
                                                    </div>
                                                ))}
                                            </Tooltip>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
