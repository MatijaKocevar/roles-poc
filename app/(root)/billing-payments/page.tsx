import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function BillingPaymentsPage() {
    const canView = await hasViewPermission("Billing & Payments");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Billing & Payments" />;
}
