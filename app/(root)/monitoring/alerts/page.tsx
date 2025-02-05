import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MonitoringAlertsPage() {
    const canView = await hasViewPermission("Alerts");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Alerts" />;
}
