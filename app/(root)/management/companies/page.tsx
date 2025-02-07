import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ManagementCompaniesPage() {
    const canView = await hasViewPermission("Management Companies");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Management Companies" />;
}
