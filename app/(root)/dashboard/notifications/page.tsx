import GenericPage from "@/components/GenericPage";
import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export default async function DashboardNotificationsPage() {
    const canView = await hasViewPermission("Notifications");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Notifications" />;
}
