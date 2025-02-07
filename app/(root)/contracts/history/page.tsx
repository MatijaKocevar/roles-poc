import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsHistoryPage() {
    const canView = await hasViewPermission("contracts-history");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="contracts-history" />;
}
