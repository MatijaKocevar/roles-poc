import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MonitoringLogsPage() {
    const canView = await hasViewPermission("Logs");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Logs" />;
}
