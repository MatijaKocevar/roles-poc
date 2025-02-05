import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MonitoringPage() {
    const canView = await hasViewPermission("Monitoring");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Monitoring" />;
}
