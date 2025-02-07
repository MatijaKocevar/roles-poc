import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
    const canView = await hasViewPermission("Reports");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Reports" />;
}
