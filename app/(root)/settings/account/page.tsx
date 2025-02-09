import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SettingsAccountPage() {
    const canView = await hasViewPermission("settings-account");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="settings-account" />;
}
