"use client";

import { useActiveUser } from "@/app/active-user-context";

export default function UserSwitcher({ userId }: { userId: number }) {
    const { setUser } = useActiveUser();

    const handleSwitch = async () => {
        const res = await fetch("/api/switch-active-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        if (res.ok) {
            const activeRes = await fetch(`/api/active-user`);

            if (activeRes.ok) {
                const data = await activeRes.json();

                setUser(data.activeUser);
            }
        }
    };

    return (
        <button onClick={handleSwitch} className="text-green-500 hover:underline">
            Switch
        </button>
    );
}
