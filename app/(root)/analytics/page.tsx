import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
    const canView = await hasViewPermission("Analytics");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Analytics" />;
}
