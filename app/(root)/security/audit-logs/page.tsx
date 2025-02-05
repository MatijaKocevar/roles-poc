import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SecurityAuditLogsPage() {
    const canView = await hasViewPermission("Role Management");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Audit Logs" />;
}
