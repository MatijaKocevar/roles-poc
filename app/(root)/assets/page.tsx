import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function AssetsPage() {
    const canView = await hasViewPermission("Assets");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Assets" />;
}
