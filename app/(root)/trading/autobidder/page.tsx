import GenericPage from "@/components/GenericPage";
import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export default async function TradingAutobidderPage() {
    const canView = await hasViewPermission("Trading Autobidder");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Trading Autobidder" />;
}
