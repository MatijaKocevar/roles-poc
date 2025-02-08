import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../../actions/hasViewPermissions";
import GenericPage from "../../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function RegulationGroupDetailsPage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;

    const canView = await hasViewPermission("assets-regulation-groups");
    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="assets-regulation-groups" />;
}
