import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function SecurityPage() {
    const canView = await hasViewPermission("Security");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Security" />;
}
