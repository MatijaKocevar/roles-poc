import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function TrandingPage() {
    const canView = await hasViewPermission("Trading");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Trading" />;
}
