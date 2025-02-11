"use client";

import { useRouter } from "next/navigation";
import { deleteAccessProfile } from "../actions/accessProfile";
import { Button } from "./ui/button";

interface DeleteAccessProfileButtonProps {
    accessProfileId: number;
}

export default function DeleteAccessProfileButton({
    accessProfileId,
}: DeleteAccessProfileButtonProps) {
    const router = useRouter();

    const handleDeleteAccessProfile = async () => {
        await deleteAccessProfile({ accessProfileId });
        router.refresh();
    };

    return (
        <Button onClick={handleDeleteAccessProfile} variant="destructive">
            Delete
        </Button>
    );
}
