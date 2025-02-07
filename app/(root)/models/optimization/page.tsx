import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ModelsOptimizationPage() {
    const canView = await hasViewPermission("models-optimization");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="models-optimization" />;
}
