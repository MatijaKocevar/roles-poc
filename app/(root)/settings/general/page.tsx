import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SettingsGeneralPage() {
    const canView = await hasViewPermission("settings-general");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName={"settings-general"} />;
}
