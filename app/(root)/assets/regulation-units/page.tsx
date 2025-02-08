import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import GenericPage from "../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function RegulationUnitsPage() {
    const canView = await hasViewPermission("assets-regulation-units");
    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="assets-regulation-units" />;
}
