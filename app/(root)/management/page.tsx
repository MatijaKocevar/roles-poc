import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ManagementPage() {
    const canView = await hasViewPermission("management");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="management" />;
}
