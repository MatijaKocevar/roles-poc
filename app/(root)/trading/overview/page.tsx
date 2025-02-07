import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function TradingOverviewPage() {
    const canView = await hasViewPermission("trading-overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="trading-overview" />;
}
