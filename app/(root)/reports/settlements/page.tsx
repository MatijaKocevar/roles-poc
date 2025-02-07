import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ReportsSettlementsPage() {
    const canView = await hasViewPermission("Reports Settlements");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Reports Settlements" />;
}
