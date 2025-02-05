import GenericPage from "@/components/GenericPage";
import { redirect } from "next/navigation";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";

export default async function BillingPaymentMethodsPage() {
    const canView = await hasViewPermission("Payment Methods");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Payment Methods" />;
}
