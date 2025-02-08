"use client";

import { useRouter } from "next/navigation";
import { useActiveUser } from "../../../../active-user-context";
import GenericPage from "../../../../../components/GenericPage";

export default function NewRolePage() {
    const router = useRouter();
    const { hasPermission } = useActiveUser();

    if (!hasPermission("management-roles", "canView")) {
        router.push("/unauthorized");
    }

    return <GenericPage pageName="management-roles" />;
}
