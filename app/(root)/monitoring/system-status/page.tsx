import GenericPage from "@/components/GenericPage";
import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export default async function MonitoringSystemStatusPage() {
    const canView = await hasViewPermission("System Status");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="System Status" />;
}
