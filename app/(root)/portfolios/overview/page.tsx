import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function PortfoliosOverviewPage() {
    const canView = await hasViewPermission("Overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Overview" />;
}
