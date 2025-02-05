import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function DashboardActivityLogPage() {
    const canView = await hasViewPermission("Activity Log");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Activity Log" />;
}
