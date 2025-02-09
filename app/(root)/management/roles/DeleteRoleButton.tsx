"use client";

import { useRouter } from "next/navigation";
import { deleteRole } from "../../../../actions/roles";
import { Button } from "../../../../components/ui/button";

interface DeleteRoleButtonProps {
    roleId: number;
}

export default function DeleteRoleButton({ roleId }: DeleteRoleButtonProps) {
    const router = useRouter();

    const handleDeleteRole = async () => {
        await deleteRole({ roleId });
        router.refresh();
    };

    return (
        <Button onClick={handleDeleteRole} variant="destructive">
            Delete
        </Button>
    );
}
