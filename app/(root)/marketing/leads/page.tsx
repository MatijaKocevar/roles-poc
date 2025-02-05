import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MarketingLeadsPage() {
    const canView = await hasViewPermission("Leads");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Leads" />;
}
