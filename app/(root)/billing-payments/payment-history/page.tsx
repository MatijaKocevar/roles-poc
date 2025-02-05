import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function BillingPaymentHistoryPage() {
    const canView = await hasViewPermission("Payment History");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Payment History" />;
}
