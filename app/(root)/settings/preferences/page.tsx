import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SettingsPreferencesPage() {
    const canView = await hasViewPermission("Preferences");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Preferences" />;
}
