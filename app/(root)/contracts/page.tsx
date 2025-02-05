import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ContractsPage() {
    const canView = await hasViewPermission("Contracts");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Contracts" />;
}
