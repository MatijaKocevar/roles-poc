import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsHistoryPage() {
    const canView = await hasViewPermission("Contracts History");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Contracts History" />;
}
