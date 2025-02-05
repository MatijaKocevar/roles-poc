import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function AnalyticsDataExportPage() {
    const canView = await hasViewPermission("Data Export");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Data Export" />;
}
