import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function PortfoliosManagePage() {
    const canView = await hasViewPermission("Manage Portfolios");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Manage Portfolios" />;
}
