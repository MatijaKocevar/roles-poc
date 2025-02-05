import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function DashboardSummaryPage() {
    const canView = await hasViewPermission("Summary");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Summary" />;
}
