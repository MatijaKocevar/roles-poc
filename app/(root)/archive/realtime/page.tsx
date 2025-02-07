import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ArchiveRealtimePage() {
    const canView = await hasViewPermission("Archive Realtime");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="Archive Realtime" />;
}
