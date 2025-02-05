import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import GenericPage from "../../../components/GenericPage";

export default async function PortfoliosPage() {
    const canView = await hasViewPermission("Portfolios");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Portfolios" />;
}
