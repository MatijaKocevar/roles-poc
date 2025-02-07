import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ManagementCompaniesPage() {
    const canView = await hasViewPermission("management-companies");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="management-companies" />;
}
