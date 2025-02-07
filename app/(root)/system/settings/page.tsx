import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SystemSettingsPage() {
    const canView = await hasViewPermission("System Settings");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="System Settings" />;
}
