import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function AnalyticsOverviewPage() {
    const canView = await hasViewPermission("Overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Overview" />;
}
