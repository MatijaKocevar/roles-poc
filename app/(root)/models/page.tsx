import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ModelsPage() {
    const canView = await hasViewPermission("models");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="models" />;
}
