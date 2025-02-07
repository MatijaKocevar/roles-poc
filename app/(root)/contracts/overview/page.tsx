import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsOverviewPage() {
    const canView = await hasViewPermission("contracts-overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="contracts-overview" />;
}
