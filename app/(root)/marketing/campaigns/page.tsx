import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MarketingCampaignsPage() {
    const canView = await hasViewPermission("Campaigns");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Campaigns" />;
}
