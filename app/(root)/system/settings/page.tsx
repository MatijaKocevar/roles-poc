import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SystemSettingsPage() {
    const canView = await hasViewPermission("system-settings");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="system-settings" />;
}
