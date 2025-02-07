import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsOverviewPage() {
    const canView = await hasViewPermission("Contracts Overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Contracts Overview" />;
}
