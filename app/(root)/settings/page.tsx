import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const canView = await hasViewPermission("Settings");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Settings" />;
}
