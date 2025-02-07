import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ModelsOptimizationPage() {
    const canView = await hasViewPermission("Models Optimization");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Models Optimization" />;
}
