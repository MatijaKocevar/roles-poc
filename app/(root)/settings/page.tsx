import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SystemPage() {
    const canView = await hasViewPermission("settings");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="settings" />;
}
