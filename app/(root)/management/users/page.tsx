import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";
import GenericPage from "../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const canView = await hasViewPermission("management-users");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="management-users" />;
}
