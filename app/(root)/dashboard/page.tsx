import GenericPage from "@/components/GenericPage";
import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../actions/hasViewPermissions";

export default async function DashboardPage() {
    const canView = await hasViewPermission("Dashboard");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Dashboard" />;
}
