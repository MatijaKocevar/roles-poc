import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import GenericPage from "../../../../components/GenericPage";

export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
    const canView = await hasViewPermission("assets-portfolios");
    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="assets-portfolios" />;
}
