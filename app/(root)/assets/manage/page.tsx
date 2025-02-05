import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function AssetsManagePage() {
    const canView = await hasViewPermission("Manage Assets");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Manage Assets" />;
}
