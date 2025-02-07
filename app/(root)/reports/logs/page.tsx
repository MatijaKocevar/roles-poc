import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ReportsLogsPage() {
    const canView = await hasViewPermission("Reports Logs");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Reports Logs" />;
}
