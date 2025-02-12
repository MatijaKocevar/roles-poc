import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function TradingHistoryPage() {
    const canView = await hasViewPermission("trading-history");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="trading-history" />;
}
