"use client";

import { useActiveUser } from "@/app/active-user-context";

export default function UserSwitcher({ userId }: { userId: number }) {
    const { setUser } = useActiveUser();

    const handleSwitch = async () => {
        const res = await fetch(`/api/user?id=${userId}`);

        if (res.ok) {
            const newUser = await res.json();
            setUser(newUser);
        }
    };

    return (
        <button onClick={handleSwitch} className="text-green-500 hover:underline">
            Switch
        </button>
    );
}
