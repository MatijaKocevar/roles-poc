import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ModelsActivationPage() {
    const canView = await hasViewPermission("models-activation");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="models-activation" />;
}
