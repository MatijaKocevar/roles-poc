import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function BillingInvoicesPage() {
    const canView = await hasViewPermission("Invoices");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Invoices" />;
}
