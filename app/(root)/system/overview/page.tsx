import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SystemOverviewPage() {
    const canView = await hasViewPermission("System Overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="System Overview" />;
}
