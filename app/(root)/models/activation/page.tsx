import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ModelsActivationPage() {
    const canView = await hasViewPermission("Models Activation");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Models Activation" />;
}
