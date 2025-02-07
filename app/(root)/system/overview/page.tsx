import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SystemOverviewPage() {
    const canView = await hasViewPermission("system-overview");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="system-overview" />;
}
