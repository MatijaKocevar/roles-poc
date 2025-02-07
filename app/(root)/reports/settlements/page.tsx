import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ReportsSettlementsPage() {
    const canView = await hasViewPermission("reports-settlements");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="reports-settlements" />;
}
