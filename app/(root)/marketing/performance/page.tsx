import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MarketingPerformancePage() {
    const canView = await hasViewPermission("Performance");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Performance" />;
}
