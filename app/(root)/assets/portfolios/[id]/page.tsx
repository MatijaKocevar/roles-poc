import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../../actions/hasViewPermissions";
import GenericPage from "../../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function PortfolioDetailsPage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;

    const canView = await hasViewPermission("assets-portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="assets-portfolios" />;
}
