import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsManagePage() {
    const canView = await hasViewPermission("Manage Contracts");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Manage Contracts" />;
}
