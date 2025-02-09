import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function TradingPage() {
    const canView = await hasViewPermission("trading");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="trading" />;
}
