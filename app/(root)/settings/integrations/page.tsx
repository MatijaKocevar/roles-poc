import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SettingsIntegrationsPage() {
    const canView = await hasViewPermission("Integrations");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Integrations" />;
}
