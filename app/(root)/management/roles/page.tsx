import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";
import GenericPage from "../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function RolesListPage() {
    const canView = await hasViewPermission("management-roles");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="management-roles" />;
}
