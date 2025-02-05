import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function MarketingPage() {
    const canView = await hasViewPermission("Marketing");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Marketing" />;
}
